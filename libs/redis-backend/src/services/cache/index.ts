import type { Cluster } from 'ioredis';

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms),
    ),
  ]);

export const get = async (
  redis: Cluster,
  key: string,
  timeoutInMs = 2147483647,
) => {
  try {
    return await (timeoutInMs
      ? withTimeout(redis.get(key), timeoutInMs)
      : redis.get(key));
  } catch (error) {
    console.error(`[ERROR] Failed to fetch key: ${key}`, error);
    return null;
  }
};

export const set = async (
  redis: Cluster,
  key: string,
  value: string,
  ttlInSecs = 2147483647 / 1000,
) => {
  try {
    await redis.set(key, value, 'EX', ttlInSecs);
  } catch (error) {
    console.error(`[ERROR] Failed to set key: ${key}`, error);
    throw error;
  }
};

export const cache = async (
  redis: Cluster,
  key: string,
  computeValue: () => Promise<string>,
  ttlInSecs = 2147483647 / 1000,
  timeout = 2147483647 / 1000,
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
  redis: Cluster,
  key: string,
  computeValue: () => Promise<string>,
  ttlInSecs = 2147483647 / 1000,
): Promise<string> => {
  const getCachedValue = async () => get(redis, key);

  const computeAndSet = async () => {
    const value = await computeValue();
    set(redis, key, value, ttlInSecs).then(() =>
      console.log(`[DEBUG] Updated cache for key: ${key}`),
    );
    console.log(`[DEBUG] Computed cache for key: ${key}`);
    return value;
  };

  const result = await Promise.race([getCachedValue(), computeAndSet()]);

  computeAndSet().catch((err) => {
    console.error(`[ERROR] Failed to update cache for key: ${key}`, err);
  });

  return result ?? 'Error';
};
