import { RedisType } from '../redis-client';

export const set = async (
  redis: RedisType,
  key: string,
  value: string,
  ttlInSecs: number,
) => redis.set(key, value, 'EX', ttlInSecs);

export const get = async (redis: RedisType, key: string) => redis.get(key);
