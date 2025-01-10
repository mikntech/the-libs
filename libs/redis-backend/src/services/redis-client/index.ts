import type { Redis as TRedis } from 'ioredis';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Redis } = require('ioredis');
import { redisSettings } from '../..';

export type RedisType = TRedis;

// Singleton Redis instances for general, pub, and sub use cases
let defaultRedisInstance: RedisType | null = null;
let pubRedisInstance: RedisType | null = null;
let subRedisInstance: RedisType | null = null;

/**
 * Creates a Redis instance with error handling and separate instances for pub/sub.
 * @param instanceType - 'default' | 'pub' | 'sub'
 * @param forceNew - Force a new connection even if a singleton exists.
 */
export const createRedisInstance = async (
  instanceType: 'default' | 'pub' | 'sub' = 'default',
  forceNew = false,
): Promise<RedisType> => {
  let instance: RedisType | null;

  switch (instanceType) {
    case 'pub':
      instance = pubRedisInstance;
      break;
    case 'sub':
      instance = subRedisInstance;
      break;
    default:
      instance = defaultRedisInstance;
  }

  if (!forceNew && instance) {
    return instance;
  }

  const newInstance = new Redis({
    ...redisSettings.uri,
    retryStrategy: (times: number): number => Math.min(times * 50, 2000),
    reconnectOnError: (err: Error): boolean => true,
    socket: {
      reconnectStrategy: (retries: number): number =>
        Math.min(retries * 50, 1000),
      keepAlive: true,
      connectTimeout: 10000,
    },
  });

  newInstance.on('ready', (): void => {
    // console.log(`✅ Redis ${instanceType} Connected Successfully`);
  });

  newInstance.on('error', (err: Error): void => {
    console.error(`❌ Redis ${instanceType} Error:`, err.message);
    if (err.message.includes('ECONNRESET')) {
      console.error(`❗️ Redis ${instanceType} Connection Reset`);
    }
  });

  newInstance.on('end', (): void => {
    console.warn(`⚠️ Redis ${instanceType} Connection Closed`);
    if (instanceType === 'default') defaultRedisInstance = null;
    if (instanceType === 'pub') pubRedisInstance = null;
    if (instanceType === 'sub') subRedisInstance = null;
  });

  try {
    await newInstance.ping(); // Ensure connection works
    if (instanceType === 'default') defaultRedisInstance = newInstance;
    if (instanceType === 'pub') pubRedisInstance = newInstance;
    if (instanceType === 'sub') subRedisInstance = newInstance;
    return newInstance;
  } catch (error) {
    console.error(`❌ Redis ${instanceType} Initialization Failed:`, error);
    throw error;
  }
};
