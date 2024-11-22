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
    redisOptions: { tls },
    slotsRefreshTimeout: 0, // Disable automatic refresh of cluster slots
    scaleReads: 'slave', // Optional: Direct read queries to read replicas
    clusterRetryStrategy: (times: number) =>
      times > 5 ? null : Math.min(times * 100, 2000),
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
  const waitForReady = () =>
    new Promise<void>((resolve, reject) => {
      const interval = setInterval(() => {
        console.log(`[DEBUG] Redis client status: ${redisCluster.status}`);
        if (redisCluster.status === 'ready') {
          clearInterval(interval);
          resolve();
        }
      }, 1000);

      redisCluster.once('error', (err: Error) => {
        clearInterval(interval);
        reject(err);
      });
    });

  await waitForReady();
  console.log('[DEBUG] Redis client is ready for use.');
  return redisCluster;
}
