import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { config } = require('dotenv');
const process = require('process');

config();

interface RedisURI {
  host: string;
  port: number;
  password: string;
  user: string;
  tls: {};
}

export interface RedisSettings {
  uri: RedisURI;
}

export const redisSettings: RedisSettings = {
  uri: {
    host: process.env['REDIS_HOST'] || '',
    port: parseInt(process.env['REDIS_PORT'] || '1'),
    password: process.env['REDIS_PASSWORD'] || '',
    user: process.env['REDIS_USER'] || '',
    tls: {},
  },
};
