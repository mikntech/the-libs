import type { Redis as TRedis } from 'ioredis';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Redis } = require('ioredis');
import { redisSettings } from '../..';

export type RedisType = TRedis;

export const createRedisInstance = async (): Promise<RedisType> => {
  const redis = new Redis({
    ...redisSettings.uri,
    socket: {
      reconnectStrategy: (retries: number) => Math.min(retries * 50, 1000),
      keepAlive: true,
      connectTimeout: 10000,
    },
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
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
