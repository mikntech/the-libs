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
    map[host] = { host: tunnelHost, port: tunnelPort }; // Directly map to tunnelHost and tunnelPort
    return map;
  }, {});

  redisNodes.forEach((node) => {
    const [host] = node.split(':');
    natMap[host] = { host: tunnelHost, port: tunnelPort };
  });

  console.log('Generated NAT Map:', natMap);
  return natMap;
}

export async function createRedisInstance(): Promise<ClusterType> {
  const natMap = await generateNatMap();
  const { host, port, tls } = redisSettings.uri;

  const redisCluster = new Cluster([{ host, port }], {
    natMap,
    scaleReads: 'slave',
    clusterRetryStrategy: (times: TODO) => {
      if (times > 5) return null;
      return Math.min(times * 100, 2000);
    },
    slotsRefreshTimeout: 0,
    slotsRefreshInterval: null, // Disable auto-refresh
    redisOptions: { tls, enableReadyCheck: true },
  });

  // Intercept `getInfoFromNode` to prevent duplication of connections
  const originalGetInfoFromNode = redisCluster.getInfoFromNode;
  redisCluster.getInfoFromNode = async function (node: TODO, command: TODO) {
    console.log(`Getting info from node: ${node.host}:${node.port}`);
    // Directly call the original method to get the info
    return originalGetInfoFromNode.call(this, node, command);
  };

  // Override `refreshSlotsCache` to use NAT mapping
  redisCluster.refreshSlotsCache = async function () {
    console.log('Intercepting refreshSlotsCache');

    const originalSlots = await this.getInfoFromNode(
      { host, port },
      'CLUSTER SLOTS',
    );

    const remappedSlots = originalSlots.map(([start, end, ...nodes]: TODO) => [
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

    console.log('Updated slot cache with NAT mapping:', remappedSlots);
    this.slots = remappedSlots;
  };

  redisCluster.on('cluster.slots', (slots: TODO) => {
    console.log('Intercepted CLUSTER.SLOTS response:', slots);
    return slots.map(([start, end, ...nodes]: TODO) => [
      start,
      end,
      ...nodes.map(([host, port]: TODO) => {
        const mapped = natMap[host];
        if (mapped) {
          console.log(
            `Remapping ${host}:${port} to ${mapped.host}:${mapped.port}`,
          );
          return [mapped.host, mapped.port];
        }
        return [host, port];
      }),
    ]);
  });

  // Debug connection events
  redisCluster.on('connect', () => {
    console.log('Redis Cluster client connected successfully.');
  });

  redisCluster.on('error', (err: Error) => {
    console.error('Redis Cluster connection error:', err);
  });

  return new Promise((resolve, reject) => {
    redisCluster.once('connect', () => resolve(redisCluster));
    redisCluster.once('error', (err: Error) => reject(err));
  });
}
