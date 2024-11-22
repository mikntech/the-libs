import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

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
  const tempDir = os.tmpdir();
  const pemPath = path.join(tempDir, 'temp_key.pem');
  fs.writeFileSync(pemPath, pemContent, { mode: 0o600 });
  return pemPath;
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
    const ssh = spawn(
      'ssh',
      [
        '-i',
        pemPath,
        '-L',
        `6379:${endpoint}:${port}`,
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
      reject(err);
    });

    ssh.on('close', (code) => {
      fs.unlinkSync(pemPath); // Cleanup PEM file here
      if (code === 0) {
        console.log('SSH tunnel closed successfully.');
        reject(new Error('SSH tunnel was unexpectedly closed.'));
      } else {
        console.error(`SSH process exited with code ${code}`);
        reject(new Error(`SSH tunnel closed with error code ${code}`));
      }
    });

    // Resolve immediately assuming the tunnel will work; add additional verification logic if needed
    console.log('SSH tunnel process started successfully.');
    resolve();
  });
}

const port = parseInt(process.env['REDIS_PORT'] || '6379');
const ip = process.env['REDIS_PROXY_IP'];
const pem = process.env['REDIS_PROXY_PEM']?.replace(/\\n/g, '\n');
const endpoint = process.env['REDIS_PROXY_ENDPOINT'];

let ec2Proxy: RedisSettings['ec2Proxy'] = undefined;

if (ip && pem && endpoint) {
  ec2Proxy = { ip, pem, endpoint };

  console.log('Establishing SSH tunnel...');
  try {
    await establishSSHTunnel(ip, pem, endpoint, port);
  } catch (err: any) {
    console.error('Error establishing SSH tunnel:', err.message);
    process.exit(1);
  }
}

const tls = process.env['REDIS_TLS']
  ? { servername: process.env['REDIS_TLS'] }
  : undefined;

export const redisSettings: RedisSettings = {
  uri: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port,
    password: process.env['REDIS_PASSWORD'] || undefined,
    user: process.env['REDIS_USER'] || undefined,
    tls: process.env['REDIS_TLS'] === 'true' ? {} : tls,
  },
  ec2Proxy,
};
