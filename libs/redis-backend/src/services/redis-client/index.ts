import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { GlideClient } = require('@valkey/valkey-glide');
import { redisSettings } from '../..';

export type RedisType = InstanceType<typeof GlideClient>;

let defaultRedisInstance: RedisType | null = null;
let pubRedisInstance: RedisType | null = null;
let subRedisInstance: RedisType | null = null;

export const createRedisInstance = async (
  instanceType: 'default' | 'pub' | 'sub' = 'default',
  forceNew = false,
): Promise<RedisType> => {
  let instance: RedisType | null;

  switch (instanceType) {
    case 'pub':
      instance = pubRedisInstance;
      break;
    case 'sub':
      instance = subRedisInstance;
      break;
    default:
      instance = defaultRedisInstance;
  }

  if (!forceNew && instance) {
    return instance;
  }

  try {
    const newInstance = await GlideClient.createClient({
      url: redisSettings.uri, // Use Redis URL from config
      socket: {
        keepAlive: true, // Enable TCP Keep-Alive
        reconnectStrategy: (retries: number) => Math.min(retries * 50, 5000),
        connectTimeout: 15000, // Allow longer connection time
      },
    });

    newInstance.on('ready', (): void => {
      console.log(`✅ Redis ${instanceType} Connected Successfully`);
    });

    newInstance.on('error', (err: Error): void => {
      console.error(`❌ Redis ${instanceType} Error:`, err.message);
      if (err.message.includes('ECONNRESET')) {
        console.error(
          `❗️ Redis ${instanceType} Connection Reset - Attempting Reconnect`,
        );
      }
    });

    newInstance.on('end', async (): Promise<void> => {
      console.warn(`⚠️ Redis ${instanceType} Connection Closed`);

      const delay = Math.random() * 10000 + 5000; // Wait 5-15s before retrying
      setTimeout(async () => {
        console.log(`♻️ Attempting to reconnect Redis ${instanceType}...`);
        try {
          await createRedisInstance(instanceType, true);
        } catch (err) {
          console.error(`❌ Redis ${instanceType} Reconnection Failed`, err);
        }
      }, delay);
    });

    await newInstance.ping(); // Ensure connection works

    if (instanceType === 'default') defaultRedisInstance = newInstance;
    if (instanceType === 'pub') pubRedisInstance = newInstance;
    if (instanceType === 'sub') subRedisInstance = newInstance;

    return newInstance;
  } catch (error) {
    console.error(`❌ Redis ${instanceType} Initialization Failed:`, error);
    throw error;
  }
};
