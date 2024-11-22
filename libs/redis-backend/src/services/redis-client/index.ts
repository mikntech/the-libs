import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Redis } = require('ioredis');
import { redisSettings } from '../..';
import type { Cluster } from 'ioredis';

export const createRedisInstance = async (): Promise<Cluster> => {
  console.log('Initializing Redis Cluster with settings:', redisSettings.uri);

  if (!redisSettings.uri.host || !redisSettings.uri.port) {
    throw new Error('Redis host or port is not defined in redisSettings.');
  }

  if (!redisSettings.uri.tls) {
    console.warn('TLS is not configured. MemoryDB requires TLS.');
  }

  const cluster = new Redis.Cluster(
    [
      {
        host: redisSettings.uri.host,
        port: redisSettings.uri.port,
      },
    ],
    {
      redisOptions: {
        tls: redisSettings.uri.tls || {},
      },
      retryDelayOnFailover: 1000, // Retry delay for slot refresh issues
      maxRetriesPerRequest: 10, // Max retries for a single request
    },
  );

  return new Promise<Cluster>((resolve, reject) => {
    let resolved = false;

    const checkState = () => {
      if (cluster.status === 'ready') {
        console.log('Redis Cluster client is ready.');
        resolved = true;
        resolve(cluster);
      } else if (cluster.status === 'end') {
        console.error('Redis Cluster client connection ended unexpectedly.');
        reject(
          new Error('Redis Cluster connection ended before becoming ready.'),
        );
      }
    };

    cluster.on('error', (err: any) => {
      console.error('[Redis Cluster Error]:', err.message);
      if (!resolved) reject(err);
    });

    // Poll the cluster's state periodically
    const interval = setInterval(() => {
      checkState();

      if (resolved) {
        clearInterval(interval);
      }
    }, 500); // Poll every 500ms
  });
};
