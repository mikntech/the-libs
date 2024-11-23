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
    console.error(`[ERROR] Failed to fetch key: ${key}`, error);
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
    console.info(`[DEBUG] Starting the SET operation for key: "${key}".`);

    // Test Redis status
    console.info(`[DEBUG] Current Redis client status: "${redis.status}"`);
    if (!redis.status || redis.status !== 'ready') {
      console.log('[INFO] Redis client not ready. Waiting for connection...');
      await new Promise<void>((resolve, reject) => {
        redis.once('ready', resolve);
        redis.once('error', reject);
      });
      console.log('[INFO] Redis connection established.');
    }

    // Test PING
    const pingResponse = await redis.ping();
    console.info(`[DEBUG] Redis PING response: "${pingResponse}"`);

    // Perform the SET operation
    console.info(
      `[DEBUG] Attempting to set key "${key}" with value "${value}" and TTL "${ttlInSecs}"`,
    );
    await redis.set(key, value, 'EX', ttlInSecs);
  } catch (error) {
    console.error(`[ERROR] Failed to set key: ${key}`, error);
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
      console.info(`[DEBUG] Updated cache for key: ${key}`),
    );
    console.info(`[DEBUG] Computed cache for key: ${key}`);
    return value;
  };

  const result = await Promise.race([getCachedValue(), computeAndSet()]);

  computeAndSet().catch((err) => {
    console.error(`[ERROR] Failed to update cache for key: ${key}`, err);
  });

  return result ?? 'Error';
};
