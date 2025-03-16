import type { Redis as TRedis } from 'ioredis';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { Redis } = require('ioredis');
import { redisSettings } from '../..';

export type RedisType = TRedis;

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
    throw new Error('❌ Redis connection failed: No Redis URL provided');
  }

  const newInstance = new Redis(redisUrl, {
    retryStrategy: (times: number): number | null => {
      if (times > 10) return null; // Stop retrying after 10 attempts
      return Math.min(50 * 2 ** times, 5000); // Exponential backoff up to 5s
    },
    reconnectOnError: (err: Error): boolean => {
      const message = err.message.toLowerCase();
      if (
        message.includes('econnreset') ||
        message.includes('etimedout') ||
        message.includes('socket closed')
      ) {
        console.error(
          `🔄 Redis ${instanceType} Reconnecting due to error:`,
          err.message,
        );
        return true;
      }
      return false;
    },
    socket: {
      keepAlive: true, // Keep TCP connection alive
      reconnectStrategy: (retries: number): number =>
        Math.min(retries * 50, 5000),
      connectTimeout: 20000, // Increased timeout to avoid drops
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

    const delay = Math.random() * 10000 + 5000; // Random 5-15s delay before retrying
    setTimeout(async () => {
      console.log(`♻️ Attempting to reconnect Redis ${instanceType}...`);
      try {
        await createRedisInstance(instanceType, true);
      } catch (err) {
        console.error(`❌ Redis ${instanceType} Reconnection Failed`, err);
      }
    }, delay);
  });

  try {
    await newInstance.ping(); // Ensure connection is stable

    if (instanceType === 'default') defaultRedisInstance = newInstance;
    if (instanceType === 'pub') pubRedisInstance = newInstance;
    if (instanceType === 'sub') subRedisInstance = newInstance;

    return newInstance;
  } catch (error) {
    console.error(`❌ Redis ${instanceType} Initialization Failed:`, error);
    throw error;
  }
};
