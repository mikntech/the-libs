import type { Redis as TRedis } from 'ioredis';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Redis } = require('ioredis');
import { redisSettings } from '../..';

export type RedisType = TRedis;

export const createRedisInstance = async (): Promise<RedisType> => {
  const redis = new Redis({
    ...redisSettings.uri,
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
    reconnectOnError: (err: any) => {
      console.error('Reconnect on error:', err);
      return true;
    },
  });

  return new Promise((resolve, reject) => {
    redis.on('ready', () => {
      resolve(redis);
    });

    redis.on('error', (err: Error) => {
      reject(err);
    });
  });
};
