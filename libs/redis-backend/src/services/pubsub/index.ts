import NodePubSub from 'pubsub-js';
import { createRedisInstance, RedisType } from '../redis-client';

class PubSub {
  private redisClient: RedisType | null;
  private fallback: typeof NodePubSub;

  constructor(redisClient: RedisType | null) {
    this.redisClient = redisClient;
    this.fallback = NodePubSub;
  }

  subscribe(channel: string, callback: Function): string | void {
    if (this.redisClient) {
      this.redisClient.subscribe(channel, (err: string) => {
        if (err) {
          console.error('Redis subscription failed:', err);
        }
      });

      this.redisClient.on(
        'message',
        (subscribedChannel: string, message: string) => {
          if (subscribedChannel === channel) {
            callback(message);
          }
        },
      );
    } else {
      return this.fallback.subscribe(channel, (msg, data) => {
        callback(data);
      });
    }
  }

  publish(channel: string, message: string) {
    if (this.redisClient) {
      this.redisClient.publish(channel, message);
    } else {
      this.fallback.publish(channel, message);
    }
  }

  unsubscribe(tokenOrChannel: string | symbol) {
    if (this.redisClient) {
      this.redisClient.unsubscribe(tokenOrChannel as string);
    } else {
      this.fallback.unsubscribe(tokenOrChannel as string);
    }
  }
}

export const subscriber = createRedisInstance() || NodePubSub;
export const publisher = createRedisInstance() || NodePubSub;
