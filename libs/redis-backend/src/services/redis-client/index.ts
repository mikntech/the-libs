import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Cluster } = require('ioredis');
import { redisSettings } from '../..';
import type { Cluster as ClusterType } from 'ioredis';
import { TODO } from '@the-libs/base-shared';

async function generateNatMap(): Promise<
  Record<string, { host: string; port: number }>
> {
  const { redisNodes, uri } = redisSettings;
  const { host, port } = uri;

  if (!redisSettings) {
    throw new Error(
      'REDIS_CLUSTER_NODES is not set. Please provide a comma-separated list of cluster nodes.',
    );
  }

  const nodes = redisNodes.map((node) => {
    const [host, port] = node.split(':');
    return { host: host.trim(), port: parseInt(port, 10) };
  });

  const natMap: Record<string, { host: string; port: number }> = {};
  nodes.forEach(({ host }) => {
    const shortName = host.split('.')[0]; // Extract the short name
    natMap[shortName] = { host, port }; // Short name
    natMap[host] = { host, port }; // Full FQDN
  });

  console.log('Generated NAT Map:', natMap);
  return natMap;
}

export async function createRedisInstance(): Promise<ClusterType> {
  const natMap = await generateNatMap();

  const { host, port, tls } = redisSettings.uri;

  const redisCluster = new Cluster(
    [
      { host, port }, // Single entry point through the tunnel
    ],
    {
      natMap,
      redisOptions: {
        tls,
        connectTimeout: 20000, // Increase timeout for slow connections
      },
      clusterRetryStrategy: (times: TODO) => {
        if (times > 5) {
          console.error('Exceeded maximum retry attempts.');
          return null; // Stop retrying after 5 attempts
        }
        return Math.min(times * 100, 2000); // Exponential backoff
      },
    },
  );

  redisCluster.on('connect', () => {
    console.log('Redis Cluster client connected successfully.');
  });

  redisCluster.on('error', (err: Error) => {
    console.error('Redis Cluster connection error:', err);
  });

  return redisCluster;
}
