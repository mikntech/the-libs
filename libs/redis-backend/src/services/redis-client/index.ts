import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Redis } = require('ioredis');
import { redisSettings } from '../..';
import type { Cluster } from 'ioredis';

export const createRedisInstance = (): Cluster =>
  new Redis.Cluster(
    [{ host: redisSettings.uri.host, port: redisSettings.uri.port }],
    { tls: redisSettings.uri.tls },
  );
