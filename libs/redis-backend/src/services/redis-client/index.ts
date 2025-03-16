import type { Redis as TRedis } from 'ioredis';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Redis } = require('ioredis');
import { redisSettings } from '../..';

export type RedisType = TRedis;

let defaultRedisInstance: RedisType | null = null;
let pubRedisInstance: RedisType | null = null;
let subRedisInstance: RedisType | null = null;
let loggedConnected = false;

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
        loggedConnected = false;
        console.error(
          `🔄 Redis ${instanceType} Reconnecting due to error:`,
          err.message,
        );
        return true;
      }
      return false;
    },
    socket: {
      reconnectStrategy: (retries: number): number =>
        Math.min(retries * 50, 3000),
      keepAlive: true,
      connectTimeout: 15000, // Increased timeout for better stability
    },
  });

  newInstance.on('ready', (): void => {
    if (!loggedConnected) {
      console.log(`✅ Redis ${instanceType} Connected Successfully`);
      loggedConnected = true;
    }
  });

  newInstance.on('error', (err: Error): void => {
    loggedConnected = false;
    console.error(`❌ Redis ${instanceType} Error:`, err.message);
    if (err.message.includes('ECONNRESET')) {
      loggedConnected = false;
      console.error(
        `❗️ Redis ${instanceType} Connection Reset - Attempting Reconnect`,
      );
    }
  });

  newInstance.on('end', async (): Promise<void> => {
    loggedConnected = false;
    console.warn(`⚠️ Redis ${instanceType} Connection Closed`);
    if (instanceType === 'default') defaultRedisInstance = null;
    if (instanceType === 'pub') pubRedisInstance = null;
    if (instanceType === 'sub') subRedisInstance = null;

    setTimeout(async () => {
      loggedConnected = false;
      console.log(`♻️ Attempting to reconnect Redis ${instanceType}...`);
      try {
        await createRedisInstance(instanceType, true);
      } catch (err) {
        loggedConnected = false;
        console.error(`❌ Redis ${instanceType} Reconnection Failed`, err);
      }
    }, 5000);
  });

  try {
    await newInstance.ping();
    if (instanceType === 'default') defaultRedisInstance = newInstance;
    if (instanceType === 'pub') pubRedisInstance = newInstance;
    if (instanceType === 'sub') subRedisInstance = newInstance;
    return newInstance;
  } catch (error) {
    loggedConnected = false;
    console.error(`❌ Redis ${instanceType} Initialization Failed:`, error);
    throw error;
  }
};
