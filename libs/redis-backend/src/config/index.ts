import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { config } = require('dotenv');
config();

interface RedisURI {
  host: string;
  port: number;
  password?: string;
  user?: string;
  tls?: {};
}

export interface RedisSettings {
  uri: RedisURI;
  /* ec2Proxy?: {
    ip: string;
    pem: string;
    endpoint: string;
  };*/
}
/*
const ip = process.env['REDIS_PROXY_IP'] || undefined;
const pem = process.env['REDIS_PROXY_PEM']
  ? process.env['REDIS_PROXY_PEM'].replace(/\\n/g, '\n')
  : undefined;
const endpoint = process.env['REDIS_PROXY_ENDPOINT'] || undefined;

let ec2Proxy = undefined;

if (ip && pem && endpoint) {
  ec2Proxy = { ip, pem, endpoint };
} */

export const redisSettings: RedisSettings = {
  uri: {
    host: process.env['REDIS_HOST'] || '127.0.0.1',
    port: parseInt(process.env['REDIS_PORT'] || '6379'),
    password: process.env['REDIS_PASSWORD'] || undefined,
    user: process.env['REDIS_USER'] || undefined,
    tls:
      process.env['REDIS_TLS'] === 'true'
        ? {}
        : process.env['REDIS_TLS']
          ? { servername: process.env['REDIS_TLS'] }
          : undefined,
  },
  // ec2Proxy,
};
