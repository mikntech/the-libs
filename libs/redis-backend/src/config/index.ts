import { config } from 'dotenv';
const process = require('process');

config();

interface RedisURI {
  host: string;
  port: number;
  password: string;
}

export interface RedisSettings {
  uri: RedisURI;
}

export const redisSettings: RedisSettings = {
  uri: {
    host: process.env['REDIS_HOST'] || '',
    port: parseInt(process.env['REDIS_PORT'] || '1'),
    password: process.env['REDIS_PASSWORD'] || '',
  },
};
