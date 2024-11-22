import Redis from 'ioredis';
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

const port = parseInt(process.env['REDIS_PORT'] || '6379');
const ip = process.env['REDIS_PROXY_IP'] || undefined;
const pem = process.env['REDIS_PROXY_PEM']
  ? process.env['REDIS_PROXY_PEM'].replace(/\\n/g, '\n')
  : undefined;
const endpoint = process.env['REDIS_PROXY_ENDPOINT'] || undefined;

let ec2Proxy = undefined;

if (ip && pem && endpoint) {
  async function testRedisConnection(): Promise<void> {
    const redis = new Redis({
      host: 'localhost', // Tunnel points to localhost
      port: 6379, // Port of the SSH tunnel
      tls: {}, // Add if MemoryDB requires TLS, else remove this line
    });

    return new Promise((resolve, reject) => {
      redis.on('connect', async () => {
        try {
          await redis.set('test-key', 'test-value');
          const value = await redis.get('test-key');
          console.log('Redis connection verified. Test value:', value);
          redis.disconnect();
          resolve();
        } catch (err: any) {
          console.error('Failed to test Redis connection:', err.message);
          redis.disconnect();
          reject(err);
        }
      });

      redis.on('error', (err) => {
        console.error('Redis connection error:', err.message);
        redis.disconnect();
        reject(err);
      });
    });
  }

  const sshUser = 'ec2-user';
  const pemPath = createTempPemFile(pem);

  new Promise((resolve, reject) => {
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
      fs.unlinkSync(pemPath);
      console.error('Error starting SSH tunnel:', err.message);
      reject(err);
    });

    ssh.on('close', (code) => {
      fs.unlinkSync(pemPath);

      if (code === 0) {
        console.log('SSH tunnel closed successfully.');
        reject(new Error('SSH tunnel was unexpectedly closed.'));
      } else {
        console.error(`SSH process exited with code ${code}`);
        reject(new Error(`SSH tunnel closed with error code ${code}`));
      }
    });

    // Test Redis connection after establishing the tunnel
    testRedisConnection()
      .then(() => {
        console.log('SSH tunnel established and Redis connection verified.');
        resolve();
      })
      .catch((err) => {
        console.error(
          'Failed to verify Redis connection after SSH tunnel:',
          err.message,
        );
        reject(err);
      });
  });
}

export const redisSettings: RedisSettings = {
  uri: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: port,
    password: process.env['REDIS_PASSWORD'] || undefined,
    user: process.env['REDIS_USER'] || undefined,
    tls:
      process.env['REDIS_TLS'] === 'true'
        ? {}
        : process.env['REDIS_TLS']
          ? { servername: process.env['REDIS_TLS'] }
          : undefined,
  },
  ec2Proxy,
};
