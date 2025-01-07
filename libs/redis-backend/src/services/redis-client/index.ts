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
      console.error('❌ Redis Error (Reconnecting):', err);
      return true; // Always try to reconnect
    },
    socket: {
      reconnectStrategy: (retries: number) => Math.min(retries * 50, 1000),
      keepAlive: true,
      connectTimeout: 10000, // 10 seconds timeout
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

// Redis Error Listener
const redis = await createRedisInstance();
redis.on('error', (err) => {
  console.error('❌ Redis Error:', err.message);
  if (err.message.includes('ECONNRESET')) {
    console.error('❗️ Redis connection was reset.');
  }
});
