import type { Redis as TRedis } from 'ioredis';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Redis } = require('ioredis');
import { redisSettings } from '../..';

export type RedisType = TRedis;

// Singleton Redis instance for better connection management
let redisInstance: RedisType | null = null;

export const createRedisInstance = async (): Promise<RedisType> => {
  if (redisInstance) return redisInstance;

  redisInstance = new Redis({
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

  redisInstance!.on('ready', () => {
    console.log('✅ Redis Connected Successfully');
  });

  redisInstance!.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err.message);
    if (err.message.includes('ECONNRESET')) {
      console.error('❗️ Connection Reset Detected');
    }
  });

  redisInstance!.on('end', () => {
    console.warn('⚠️ Redis Connection Closed');
  });

  try {
    await redisInstance!.ping(); // Test the connection on init
    console.log('✅ Redis Connection Verified');
  } catch (error) {
    console.error('❌ Initial Redis Connection Failed:', error);
    throw error;
  }

  return redisInstance!;
};
