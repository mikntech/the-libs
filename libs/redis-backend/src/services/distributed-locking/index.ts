import { RedisType } from '../redis-client';
import { TODO } from '@base-shared';

export const runTaskWithLock = <CBR = any>(
  redis: RedisType,
  LOCK_KEY: string,
  LOCK_TIMEOUT: number,
  task: (...args: any) => CBR,
  interval?: number,
) => {
  const acquireLock = async () => {
    const result = await redis.set(
      LOCK_KEY,
      'locked',
      'NX' as TODO,
      'EX' as TODO,
      LOCK_TIMEOUT as TODO,
    );
    return result === 'OK';
  };

  const releaseLock = async () => redis.del(LOCK_KEY);

  const runTask = async () => {
    const lockAcquired = await acquireLock();
    if (!lockAcquired) {
      console.log('Another instance is already running the task.');
      return;
    }
    let ret: CBR;
    try {
      console.log('Running periodic task...');
      ret = task();
    } finally {
      await releaseLock();
      console.log('Task completed and lock released.');
    }
    return ret;
  };

  interval ? setInterval(runTask, interval) : setTimeout(runTask, 0);
};
