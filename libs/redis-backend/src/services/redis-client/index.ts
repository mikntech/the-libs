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
      enableReadyCheck: false, // Disable ready check
    },
    slotsRefreshTimeout: 0, // Disable automatic refresh of cluster slots
    scaleReads: 'all', // Allow reads from all nodes in the cluster
    clusterRetryStrategy: (times: number) => {
      console.warn(`[WARN] Retry attempt: ${times}`);
      if (times > 10) return null; // Stop after 10 retries
      return Math.min(times * 100, 2000);
    },
  });

  // Forcefully intercept CLUSTER SLOTS response
  redisCluster.on('cluster.slots', (slots: TODO) => {
    console.log('Intercepting CLUSTER.SLOTS response');
    return slots.map(([start, end, ...nodes]: TODO) => [
      start,
      end,
      ...nodes.map(([nodeHost, nodePort]: TODO) => {
        const mapped = natMap[nodeHost];
        if (mapped) {
          console.log(
            `Remapping ${nodeHost}:${nodePort} to ${mapped.host}:${mapped.port}`,
          );
          return [mapped.host, mapped.port];
        }
        return [nodeHost, nodePort];
      }),
    ]);
  });

  // Disable automatic refresh to prevent overwriting NAT mapping
  redisCluster.refreshSlotsCache = async function () {
    console.log('Manually refreshing cluster slots...');
    const nodes = Object.keys(natMap);
    this.slots = [
      [
        0,
        16383,
        ...nodes.map((node) => [natMap[node].host, natMap[node].port]),
      ],
    ];
    console.log('Refreshed slots cache:', this.slots);
  };

  redisCluster.on('connect', () => {
    console.log('[DEBUG] Redis Cluster connected.');
  });

  redisCluster.on('ready', () => {
    console.log('[DEBUG] Redis Cluster is ready.');
  });

  redisCluster.on('error', (err: Error) => {
    console.error('[ERROR] Redis Cluster error:', err);
  });

  redisCluster.on('end', () => {
    console.log('[DEBUG] Redis Cluster connection ended.');
  });

  redisCluster.on('reconnecting', () => {
    console.log('[DEBUG] Redis Cluster reconnecting...');
  });

  // Continuously log the status until ready
  const waitForReady = async () => {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('[ERROR] Redis client timeout. Forcing reconnection.');
        redisCluster.disconnect();
        redisCluster.connect();
      }, 10000); // 10 seconds timeout

      redisCluster.on('ready', () => {
        clearTimeout(timeout);
        console.log('[INFO] Redis client is ready.');
        resolve();
      });

      redisCluster.on('error', (err: Error) => {
        clearTimeout(timeout);
        console.error('[ERROR] Redis client error:', err);
        reject(err);
      });
    });
  };

  redisCluster.on('ready', () => console.log('[INFO] Redis Cluster is ready.'));
  redisCluster.on('connect', () =>
    console.log('[INFO] Redis Cluster connected.'),
  );
  redisCluster.on('close', () =>
    console.log('[WARN] Redis Cluster connection closed.'),
  );
  redisCluster.on('end', () =>
    console.log('[ERROR] Redis Cluster connection ended.'),
  );
  redisCluster.on('error', (err: Error) =>
    console.error('[ERROR] Redis Cluster error:', err),
  );
  redisCluster.on('node error', (err: Error, address: string) => {
    console.error(`[ERROR] Node error for ${address}:`, err);
  });
  redisCluster.on('reconnecting', () =>
    console.log('[INFO] Redis Cluster is reconnecting...'),
  );
  redisCluster.on('slotsRefresh', () => console.log('[INFO] Slots refreshed.'));

  await waitForReady();
  console.log('[DEBUG] Redis client is ready for use.');
  return redisCluster;
}
