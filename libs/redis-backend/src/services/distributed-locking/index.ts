import { Redis } from 'ioredis';

export const runTask = <CBR = any>(
  redis: Redis,
  LOCK_KEY: string,
  LOCK_TIMEOUT: number,
  task: (...args: any) => CBR,
  interval?: number,
) => {
  const acquireLock = async () => {
    const result = await redis.set(
      LOCK_KEY,
      'locked',
      'NX',
      'EX',
      LOCK_TIMEOUT,
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
