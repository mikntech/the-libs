import type { Redis as TRedis } from 'ioredis';
import { createRequire } from 'module';
import { MemoryRedis } from './memory-redis';

const require = createRequire(import.meta.url);
const { Redis } = require('ioredis');
import { redisSettings } from '../..';

export type RedisType = TRedis | MemoryRedis;

let defaultRedisInstance: RedisType | null = null;
let pubRedisInstance: RedisType | null = null;
let subRedisInstance: RedisType | null = null;

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

  const redisUrl = redisSettings.uri;
  if (!redisUrl) {
    console.warn('⚠️ No Redis URL provided - Using in-memory implementation');
    const memoryInstance = new MemoryRedis();
    if (instanceType === 'default') defaultRedisInstance = memoryInstance;
    if (instanceType === 'pub') pubRedisInstance = memoryInstance;
    if (instanceType === 'sub') subRedisInstance = memoryInstance;
    return memoryInstance;
  }

  // Check if Redis is available before attempting to connect
  try {
    const testConnection = new Redis(redisUrl, {
      socket: {
        connectTimeout: 2000, // 2 second timeout
        keepAlive: true,
      },
      maxRetriesPerRequest: 1, // Only try once
    });

    await testConnection.ping();
    await testConnection.quit();

    // If we get here, Redis is available, proceed with normal connection
    const newInstance = new Redis(redisUrl, {
      socket: {
        keepAlive: true,
      },
    });

    newInstance.on('ready', (): void => {
      console.log(`✅ Redis ${instanceType} Connected Successfully`);
    });

    newInstance.on('error', (err: Error): void => {
      console.error(`❌ Redis ${instanceType} Error:`, err.message);
      if (err.message.includes('ECONNRESET')) {
        console.error(
          `❗️ Redis ${instanceType} Connection Reset - Attempting Reconnect`,
        );
      }
    });

    newInstance.on('end', async (): Promise<void> => {
      console.warn(`⚠️ Redis ${instanceType} Connection Closed`);
      // Instead of trying to reconnect, fall back to in-memory
      const memoryInstance = new MemoryRedis();
      if (instanceType === 'default') defaultRedisInstance = memoryInstance;
      if (instanceType === 'pub') pubRedisInstance = memoryInstance;
      if (instanceType === 'sub') subRedisInstance = memoryInstance;
    });

    if (instanceType === 'default') defaultRedisInstance = newInstance;
    if (instanceType === 'pub') pubRedisInstance = newInstance;
    if (instanceType === 'sub') subRedisInstance = newInstance;

    return newInstance;
  } catch (error) {
    console.warn(`⚠️ Redis ${instanceType} not available - Using in-memory implementation`);
    const memoryInstance = new MemoryRedis();
    
    if (instanceType === 'default') defaultRedisInstance = memoryInstance;
    if (instanceType === 'pub') pubRedisInstance = memoryInstance;
    if (instanceType === 'sub') subRedisInstance = memoryInstance;
    
    return memoryInstance;
  }
};
