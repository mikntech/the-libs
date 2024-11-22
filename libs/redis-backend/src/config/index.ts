import { createRequire } from 'module';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';

const require = createRequire(import.meta.url);
const { config } = require('dotenv');
config();

function createTempPemFile(pemContent: string) {
  const tempDir = os.tmpdir();
  const pemPath = path.join(tempDir, 'temp_key.pem');
  fs.writeFileSync(pemPath, pemContent, { mode: 0o600 });
  return pemPath;
}

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

const port = parseInt(process.env['REDIS_PORT'] || '6379');
const ip = process.env['REDIS_PROXY_IP'] || undefined;
const pem = process.env['REDIS_PROXY_PEM']
  ? process.env['REDIS_PROXY_PEM'].replace(/\\n/g, '\n')
  : undefined;
const endpoint = process.env['REDIS_PROXY_ENDPOINT'] || undefined;

let ec2Proxy = undefined;

if (ip && pem && endpoint) {
  ec2Proxy = { ip, pem, endpoint };
  const sshUser = 'ec2-user';

  const pemPath = createTempPemFile(pem);

  const ssh = spawn(
    'ssh',
    ['-i', pemPath, '-L', `6379:${endpoint}:${port}`, `${sshUser}@${ip}`, '-N'],
    {
      stdio: ['inherit', 'inherit', 'inherit'],
    },
  );

  ssh.on('close', (code) => {
    fs.unlinkSync(pemPath);

    if (code === 0) {
      console.log('SSH tunnel closed successfully.');
    } else {
      console.error(`SSH process exited with code ${code}`);
    }
  });

  ssh.on('error', (err) => {
    console.error('Error starting SSH tunnel:', err.message);
    fs.unlinkSync(pemPath);
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
