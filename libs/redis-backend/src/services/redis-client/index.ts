import type { RedisOptions } from 'ioredis';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const RedisClientClass = require('ioredis');
import { redisSettings } from '../..';

export type RedisType = typeof RedisClientClass;

export const createRedisInstance = () => {
  try {
    return new RedisClientClass(redisSettings.uri as RedisOptions); // the type assertion is not needed but makes a potential mismatch between RedisOptions and RedisURI in the future easier to debug
  } catch (e) {
    console.log(e);
  }
  return null;
};

export const redisClient = createRedisInstance();
