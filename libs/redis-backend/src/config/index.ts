import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import net from 'net'; // Used to test port connectivity

interface RedisURI {
  host: string;
  port: number;
  password?: string;
  user?: string;
  tls?: { servername?: string };
}

export interface RedisSettings {
  uri: RedisURI;
  ec2Proxy?: {
    ip: string;
    pem: string;
    endpoint: string;
  };
}

function createTempPemFile(pemContent: string): string {
  try {
    const tempDir = os.tmpdir();
    const pemPath = path.join(tempDir, 'temp_key.pem');
    fs.writeFileSync(pemPath, pemContent, { mode: 0o600 });
    return pemPath;
  } catch (err: any) {
    console.error('Error creating temporary PEM file:', err.message);
    throw err;
  }
}

async function waitForPort(
  host: string,
  port: number,
  timeout = 10000,
): Promise<void> {
  const start = Date.now();
  console.log(`Waiting for port ${port} on ${host} to become available...`);

  while (Date.now() - start < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const socket = net.createConnection({ host, port }, () => {
          socket.end();
          resolve(true);
        });
        socket.on('error', reject);
      });
      console.log(`Port ${port} on ${host} is now available.`);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500)); // Wait before retrying
    }
  }

  throw new Error(
    `Port ${port} on ${host} did not become available within ${timeout}ms.`,
  );
}

async function establishSSHTunnel(
  ip: string,
  pem: string,
  endpoint: string,
  port: number,
): Promise<void> {
  const sshUser = 'ec2-user';
  const pemPath = createTempPemFile(pem);

  return new Promise<void>((resolve, reject) => {
    console.log(
      `Starting SSH tunnel to ${ip}, forwarding 127.0.0.1:${port} to ${endpoint}:${port}...`,
    );
    const ssh = spawn(
      'ssh',
      [
        '-i',
        pemPath,
        '-L',
        `127.0.0.1:${port}:${endpoint}:${port}`,
        `${sshUser}@${ip}`,
        '-N',
        '-o',
        'StrictHostKeyChecking=no',
        '-o',
        'UserKnownHostsFile=/dev/null',
      ],
      {
        stdio: 'ignore',
      },
    );

    ssh.on('error', (err) => {
      console.error('Error starting SSH tunnel:', err.message);
      cleanupPemFile(pemPath);
      reject(err);
    });

    ssh.on('close', (code) => {
      cleanupPemFile(pemPath);
      if (code === 0) {
        console.log('SSH tunnel closed successfully.');
        reject(new Error('SSH tunnel was unexpectedly closed.'));
      } else {
        console.error(`SSH process exited with code ${code}`);
        reject(new Error(`SSH tunnel closed with error code ${code}`));
      }
    });

    console.log('SSH tunnel process started successfully.');
    resolve();
  });
}

function cleanupPemFile(pemPath: string): void {
  try {
    if (fs.existsSync(pemPath)) {
      fs.unlinkSync(pemPath);
      console.log('Temporary PEM file deleted.');
    }
  } catch (err: any) {
    console.error('Error cleaning up PEM file:', err.message);
  }
}

function validateEnvironmentVariables(): void {
  const requiredEnvVars = [
    'REDIS_PROXY_IP',
    'REDIS_PROXY_PEM',
    'REDIS_PROXY_ENDPOINT',
  ];
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      throw new Error(`Environment variable ${varName} is not defined.`);
    }
  }
}

// Main
const port = parseInt(process.env['REDIS_PORT'] || '6379');
const ip = process.env['REDIS_PROXY_IP'];
const pem = process.env['REDIS_PROXY_PEM']?.replace(/\\n/g, '\n');
const endpoint = process.env['REDIS_PROXY_ENDPOINT'];

validateEnvironmentVariables();

let ec2Proxy: RedisSettings['ec2Proxy'] = undefined;

if (ip && pem && endpoint) {
  ec2Proxy = { ip, pem, endpoint };

  console.log('Establishing SSH tunnel...');
  try {
    await establishSSHTunnel(ip, pem, endpoint, port);
    console.log('SSH tunnel established successfully.');

    console.log('Testing connection to Redis via SSH tunnel...');
    await waitForPort('127.0.0.1', port);

    console.log('Testing connection to Redis via SSH tunnel...');

    const testConnection = spawn(
      'redis-cli',
      ['-h', '127.0.0.1', '-p', '6379', '--tls'],
      {
        stdio: 'inherit',
      },
    );

    testConnection.on('close', (code) => {
      if (code === 0) {
        console.log('Redis connection test successful.');
      } else {
        console.error(`Redis connection test failed with code ${code}.`);
      }
    });

    console.log('Confirmed SSH tunnel is operational. Proceeding...');
  } catch (err: any) {
    console.error(
      'Error establishing SSH tunnel or verifying connectivity:',
      err.message,
    );
  }
}

const tls = process.env['REDIS_TLS']
  ? { servername: process.env['REDIS_TLS'] }
  : undefined;

export const redisSettings: RedisSettings = {
  uri: {
    host: process.env['REDIS_HOST'] || '127.0.0.1',
    port,
    password: process.env['REDIS_PASSWORD'] || undefined,
    user: process.env['REDIS_USER'] || undefined,
    tls: process.env['REDIS_TLS'] === 'true' ? {} : tls,
  },
  ec2Proxy,
};
