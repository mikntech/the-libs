import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Cluster } = require('ioredis');

import type { Cluster as ClusterType } from 'ioredis';
import fs from 'fs';

interface RedisClusterConfig {
  startupNodes: { host: string; port: number }[];
  natMap?: Record<string, { host: string; port: number }>;
  useTLS?: boolean;
}

function loadClusterConfig(): RedisClusterConfig {
  const useTLS = true;

  console.log('[INFO] Using local Redis configuration');
  return {
    startupNodes: [
      { host: '127.0.0.1', port: 6379 }, // Replace with SSH tunnel localhost port
    ],
    natMap: {
      // NAT mapping for SSH tunneled connection
      'redis-0001-001': { host: '127.0.0.1', port: 6379 },
      'redis-0001-002': { host: '127.0.0.1', port: 6379 },
    },
    useTLS,
  };
}

export async function createRedisInstance(): Promise<ClusterType> {
  const config = loadClusterConfig();

  const redisCluster = new Cluster(config.startupNodes, {
    natMap: config.natMap,
    redisOptions: config.useTLS
      ? {
          tls: {
            rejectUnauthorized: true,
            ca: [fs.readFileSync('/path/to/ca.pem')],
            servername:
              'redis-0001-001.redis.3pwxex.memorydb.eu-central-1.amazonaws.com',
          },
        }
      : undefined,
    slotsRefreshInterval: 30000,
    slotsRefreshTimeout: 5000,
    enableReadyCheck: true,
    clusterRetryStrategy: (attempts: number) => {
      if (attempts > 10) {
        console.error('[ERROR] Maximum retry attempts reached');
        return null;
      }
      return Math.min(attempts * 100, 2000); // Backoff strategy
    },
  });

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('[ERROR] Redis Cluster initialization timeout');
        redisCluster.disconnect();
        reject(new Error('Initialization timeout'));
      }, 60000);

      redisCluster.on('ready', () => {
        clearTimeout(timeout);
        console.log('[INFO] Redis Cluster is ready');
        resolve();
      });

      redisCluster.on('error', (err: Error) => {
        console.error(
          '[ERROR] Redis Cluster error during initialization:',
          err,
        );
        reject(err);
      });
    });
  } catch (err) {
    console.error('[ERROR] Failed to initialize Redis Cluster:', err);
    throw err;
  }

  return redisCluster;
}
