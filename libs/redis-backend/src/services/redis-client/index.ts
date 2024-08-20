import RedisClientClass from 'ioredis';
import { redisSettings } from '../..';

export type RedisType = RedisClientClass;

export const createRedisInstance = () => {
  try {
    return new RedisClientClass(redisSettings.uri);
  } catch (e) {
    console.log(e);
  }
  return null;
};

export const redisClient = createRedisInstance();
