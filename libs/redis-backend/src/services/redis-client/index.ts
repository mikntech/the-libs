import type { Redis as TRedis } from 'ioredis';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Redis } = require('ioredis');
import { redisSettings } from '../..';

export type RedisType = TRedis;

export const createRedisInstance = (): RedisType | null => {
  try {
    return new Redis(redisSettings.uri);
  } catch (e) {
    console.log(e);
  }
  return null;
};
