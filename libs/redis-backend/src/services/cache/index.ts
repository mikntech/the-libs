import { RedisType } from '../redis-client';

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms),
    ),
  ]);

export const get = async (
  redis: RedisType,
  key: string,
  timeoutInMs = 2147483647,
) => {
  try {
    return await (timeoutInMs
      ? withTimeout(redis.get(key), timeoutInMs)
      : redis.get(key));
  } catch (error) {
    return null;
  }
};

export const set = async (
  redis: RedisType,
  key: string,
  value: string,
  ttlInSecs = 10 * 365 * 24 * 60 * 60, // Default TTL: 10 years
): Promise<void> => {
  try {
    

    // Test Redis status
    
    if (!redis.status || redis.status !== 'ready') {
      await new Promise<void>((resolve, reject) => {
        redis.once('ready', resolve);
        redis.once('error', reject);
      });
    }

    // Test PING
    const pingResponse = await redis.ping();
    

    // Perform the SET operation
    
      `[DEBUG] Attempting to set key "${key}" with value "${value}" and TTL "${ttlInSecs}"`,
    );
    await redis.set(key, value, 'EX', ttlInSecs);
  } catch (error) {
    throw error;
  }
};

export const cache = async (
  redis: RedisType,
  key: string,
  computeValue: () => Promise<string>,
  ttlInSecs = 2147483000 / 1000,
  timeout = 2147483000 / 1000,
): Promise<string> => {
  const cachedValue = await get(redis, key, timeout);

  if (cachedValue !== null) {
    return cachedValue;
  }

  const value = await computeValue();

  await set(redis, key, value, ttlInSecs);

  return value;
};

export const raceCache = async (
  redis: RedisType,
  key: string,
  computeValue: () => Promise<string>,
  ttlInSecs = 2147483647 / 1000,
): Promise<string> => {
  const getCachedValue = async () => get(redis, key);

  const computeAndSet = async () => {
    const value = await computeValue();
    set(redis, key, value, ttlInSecs).then(() =>
      
    );
    
    return value;
  };

  const result = await Promise.race([getCachedValue(), computeAndSet()]);

  computeAndSet().catch((err) => {});

  return result ?? 'Error';
};
