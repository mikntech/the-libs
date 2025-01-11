import { createRedisInstance, RedisType } from '../redis-client';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { default: Redlock } = require('redlock');

export const runTaskWithLock = <CBR = any>(
  redis: RedisType,
  LOCK_KEY: string,
  LOCK_TIMEOUT: number,
  task: () => CBR,
  interval?: number,
) => {
  const redlock = new Redlock([redis], {
    retryCount: 0, // No retries to avoid overlap
  });

  const runTask = async () => {
    try {
      const lock = await redlock.acquire([LOCK_KEY], LOCK_TIMEOUT);
      try {
        task();
      } finally {
        await lock.release();
        /*
        console.log('Task completed and lock released.');
*/
      }
    } catch (err) {
      // console.log('Another instance is already running the task.');
    }
  };

  interval ? setInterval(runTask, interval) : setTimeout(runTask, 0);
};

/**
 * Acquires a Redis lock using raw commands to avoid TypeScript issues.
 * @param {string} key - The key for the lock
 * @param {number} ttl - Lock expiration in milliseconds
 * @returns {Promise<boolean>} - True if the lock was acquired, false otherwise
 */
export const lock = async (
  key: string,
  ttl: number = 10000,
): Promise<boolean> => {
  const redis = await createRedisInstance();
  const result = await redis.call('SET', key, 'locked', 'NX', 'PX', ttl);
  return result === 'OK';
};

/**
 * Releases a Redis lock by deleting the key
 * @param {string} key - The key for the lock
 */
export const unlock = async (key: string): Promise<void> => {
  const redis = await createRedisInstance();
  await redis.del(key);
};
