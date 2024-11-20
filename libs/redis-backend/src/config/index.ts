import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { config } = require('dotenv');
const process = require('process');
const { spawn } = require('child_process');

config();

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
const pem = process.env['REDIS_PROXY_PEM'] || undefined;
const endpoint = process.env['REDIS_PROXY_ENDPOINT'] || undefined;
let ec2Proxy = undefined;
if (ip && pem && endpoint) {
  ec2Proxy = { ip, pem, endpoint };
  const sshUser = 'ec2-user';

  const ssh = spawn(
    'ssh',
    [
      '-i',
      '/dev/stdin',
      '-L',
      `6379:${endpoint}:${port}`,
      `${sshUser}@${ip}`,
      '-N',
    ],
    {
      stdio: ['pipe', 'inherit', 'inherit'],
    },
  );

  ssh.stdin.write(pem);
  ssh.stdin.end();

  ssh.on('close', (code: number) => {
    if (code === 0) {
      console.log('SSH tunnel closed successfully.');
    } else {
      console.error(`SSH process exited with code ${code}`);
    }
  });
}

export const redisSettings: RedisSettings = {
  uri: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: port,
    password: process.env['REDIS_PASSWORD'] || undefined,
    user: process.env['REDIS_USER'] || undefined,
    tls:
      process.env['REDIS_TLS'] || undefined
        ? undefined
        : process.env['REDIS_TLS'] === 'true'
          ? {}
          : {
              servername: process.env['REDIS_TLS'],
            },
  },
  ec2Proxy,
};
