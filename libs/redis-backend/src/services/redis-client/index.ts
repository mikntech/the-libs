import type { Redis as TRedis } from 'ioredis';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Redis } = require('ioredis');
import { redisSettings } from '../..';

export type RedisType = TRedis;

// Singleton Redis instance with safe handling
let redisInstance: RedisType | null = null;

/**
 * Creates or returns a Redis instance with error handling
 * Ensures a safe singleton pattern and prevents multiple connections.
 */
export const createRedisInstance = async (): Promise<RedisType> => {
  if (redisInstance) {
    //  console.log('⚡️ Reusing existing Redis connection');
    return redisInstance;
  }

  redisInstance = new Redis({
    ...redisSettings.uri,
    retryStrategy: (times: number): number => Math.min(times * 50, 2000),
    reconnectOnError: (err: Error): boolean => {
      // console.error('❌ Redis Reconnect Error:', err.message);
      return true; // Attempt to reconnect on error
    },
    socket: {
      reconnectStrategy: (retries: number): number =>
        Math.min(retries * 50, 1000),
      keepAlive: true,
      connectTimeout: 10000, // 10 seconds timeout
    },
  });

  redisInstance?.on('ready', (): void => {
    // console.log('✅ Redis Connected Successfully');
  });

  redisInstance?.on('error', (err: Error): void => {
    // console.error('❌ Redis Connection Error:', err.message);
    if (err.message.includes('ECONNRESET')) {
      // console.error('❗️ Connection Reset Detected');
    }
  });

  redisInstance?.on('end', (): void => {
    // console.warn('⚠️ Redis Connection Closed');
    redisInstance = null; // Prevent reusing a closed connection
  });

  try {
    // ✅ Explicit null check and safe testing for the connection
    if (!redisInstance) throw new Error('Redis instance failed to initialize');
    await redisInstance.ping(); // Test initial connection
    // console.log('✅ Redis Connection Verified');
    return redisInstance;
  } catch (error) {
    // console.error('❌ Initial Redis Connection Failed:', error);
    redisInstance = null; // Prevent using a failed connection
    throw error;
  }
};
