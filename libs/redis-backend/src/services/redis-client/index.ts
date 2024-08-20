import RedisClientClass from 'ioredis';
import { redisSettings } from '../..';

export const redisClient = new RedisClientClass(redisSettings.uri);