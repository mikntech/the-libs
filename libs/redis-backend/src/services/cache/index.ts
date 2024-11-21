import type { Cluster } from 'ioredis';

export const set = async (
  redis: Cluster,
  key: string,
  value: string,
  ttlInSecs: number,
) => redis.set(key, value, 'EX', ttlInSecs);

export const get = async (redis: Cluster, key: string) => redis.get(key);

export const cache = async (
  redis: Cluster,
  key: string,
  computeValue: () => Promise<string>,
  ttlInSecs: number,
): Promise<string> => {
  const cachedValue = await get(redis, key);

  if (cachedValue !== null) {
    return cachedValue;
  }

  const value = await computeValue();

  await set(redis, key, value, ttlInSecs);

  return value;
};
