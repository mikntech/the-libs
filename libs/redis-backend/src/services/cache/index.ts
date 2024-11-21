import { RedisType } from '../redis-client';

export const set = async (
  redis: RedisType,
  key: string,
  value: string,
  ttlInSecs: number,
) => redis.set(key, value, 'EX', ttlInSecs);

export const get = async (redis: RedisType, key: string) => redis.get(key);

export const cache = async (
  redis: RedisType,
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
