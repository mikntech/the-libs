import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Cluster } = require('ioredis');
import { redisSettings } from '../..';
import type { Cluster as ClusterType } from 'ioredis';
import { TODO } from '@the-libs/base-shared';

async function generateNatMap() {
  const { redisNodes, uri } = redisSettings;
  const { host: tunnelHost, port: tunnelPort } = uri;

  if (!redisNodes || redisNodes.length === 0) {
    throw new Error('REDIS_CLUSTER_NODES is not set.');
  }

  const natMap = redisNodes.reduce((map: TODO, node) => {
    const [host] = node.split(':');
    map[host] = { host: tunnelHost, port: tunnelPort };
    return map;
  }, {});

  console.log('Generated NAT Map:', natMap);
  return natMap;
}

export async function createRedisInstance(): Promise<ClusterType> {
  const natMap = await generateNatMap();
  const { host, port, tls } = redisSettings.uri;

  const redisCluster = new Cluster([{ host, port }], {
    natMap,
    redisOptions: {
      tls,
      connectTimeout: 20000, // 20 seconds timeout,
      enableReadyCheck: true, // Enable ready check
    },
    scaleReads: 'all', // Allow reads from all nodes in the cluster
    clusterRetryStrategy: (times: number) => {
      console.warn(`[WARN] Retry attempt: ${times}`);
      if (times > 10) return null; // Stop after 10 retries
      return Math.min(times * 100, 2000);
    },
  });

  // Event Listeners for Debugging
  redisCluster.on('connect', () => {
    console.log('[INFO] Redis Cluster connected.');
  });

  redisCluster.on('ready', () => {
    console.log('[INFO] Redis Cluster is ready.');
  });

  redisCluster.on('error', (err: Error) => {
    console.error('[ERROR] Redis Cluster error:', err);
  });

  redisCluster.on('end', () => {
    console.error('[ERROR] Redis Cluster connection ended.');
  });

  redisCluster.on('reconnecting', () => {
    console.log('[WARN] Redis Cluster is reconnecting...');
  });

  redisCluster.on('node error', (err: Error, address: string) => {
    console.error(`[ERROR] Node error for ${address}:`, err);
  });

  // Wait for Ready
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.error('[ERROR] Redis client timeout.');
      redisCluster.disconnect();
      reject(new Error('Redis client timeout'));
    }, 30000); // 30 seconds timeout

    redisCluster.once('ready', () => {
      clearTimeout(timeout);
      console.log('[INFO] Redis client is ready.');
      resolve();
    });

    redisCluster.once('error', (err: Error) => {
      clearTimeout(timeout);
      console.error(
        '[ERROR] Redis connection error during initialization:',
        err,
      );
      reject(err);
    });
  });

  return redisCluster;
}
