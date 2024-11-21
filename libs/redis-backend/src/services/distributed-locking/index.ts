import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { default: Redlock } = require('redlock');
import type Cluster from 'ioredis';

export const runTaskWithLock = <CBR = any>(
  redis: Cluster,
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
        console.log('Running periodic task...');
        task();
      } finally {
        await lock.release();
        console.log('Task completed and lock released.');
      }
    } catch (err) {
      console.log('Another instance is already running the task.');
    }
  };

  interval ? setInterval(runTask, interval) : setTimeout(runTask, 0);
};
