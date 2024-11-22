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
  const { host: tunnelHost, port: tunnelPort } = uri;

  if (!redisNodes || redisNodes.length === 0) {
    throw new Error(
      'REDIS_CLUSTER_NODES is not set. Please provide a list of cluster nodes.',
    );
  }

  const nodes = redisNodes.map((node) => {
    const [host, port] = node.split(':');
    return { host: host.trim(), port: parseInt(port, 10) };
  });

  const natMap: Record<string, { host: string; port: number }> = {};
  nodes.forEach(({ host }) => {
    const shortName = host.split('.')[0];
    natMap[shortName] = { host: tunnelHost, port: tunnelPort };
    natMap[host] = { host: tunnelHost, port: tunnelPort };
  });

  console.log('Generated NAT Map:', natMap);
  return natMap;
}

export async function createRedisInstance(): Promise<ClusterType> {
  const natMap = await generateNatMap();

  const { host, port, tls } = redisSettings.uri;

  const redisCluster = new Cluster(
    [
      { host, port }, // Entry point through the SSH tunnel
    ],
    {
      natMap,
      redisOptions: {
        tls,
        connectTimeout: 20000,
      },
      clusterRetryStrategy: (times: TODO) => {
        if (times > 5) {
          console.error('Exceeded maximum retry attempts.');
          return null;
        }
        return Math.min(times * 100, 2000);
      },
    },
  );

  return new Promise((resolve, reject) => {
    redisCluster.on('connect', () => {
      console.log('Redis Cluster client connected successfully.');
      resolve(redisCluster);
    });

    redisCluster.on('error', (err: Error) => {
      console.error('Redis Cluster connection error:', err);
      reject(err);
    });
  });
}
