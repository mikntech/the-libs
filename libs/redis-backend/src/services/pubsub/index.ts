import NodePubSub from 'pubsub-js';
import { createRedisInstance, RedisType } from '../redis-client';
import { TODO } from '@the-libs/base-shared';

class PubSub {
  private redisSubscriber: RedisType | null;
  private redisPublisher: RedisType | null;
  private fallback: typeof NodePubSub;

  constructor(redis: RedisType) {
    // Create separate Redis instances for subscriber and publisher
    this.redisSubscriber = redis;
    this.redisPublisher = redis;
    this.fallback = NodePubSub;
  }

  subscribe(
    channel: string,
    callback: (message: string) => void,
  ): string | (() => void) | void {
    if (this.redisSubscriber) {
      this.redisSubscriber.subscribe(
        channel,
        (err: Error | null | undefined) => {
          if (err) console.error('Redis subscription failed:', err);
        },
      );

      const messageListener = (subscribedChannel: string, message: string) => {
        if (subscribedChannel === channel) {
          callback(message);
        }
      };

      this.redisSubscriber.on('message', messageListener);

      return () => {
        this.redisSubscriber?.unsubscribe(
          channel,
          (err: Error | null | undefined) => {
            if (err) console.error('Redis unsubscription failed:', err);
          },
        );
        this.redisSubscriber?.off('message', messageListener);
      };
    } else {
      return this.fallback.subscribe(channel, (msg, data) => callback(data));
    }
  }

  publish(channel: string, message: string) {
    if (this.redisPublisher) {
      this.redisPublisher.publish(
        channel,
        message,
        (err: Error | null | undefined) => {
          if (err) console.error('Redis publish failed:', err);
        },
      );
    } else {
      this.fallback.publish(channel, message);
    }
  }

  unsubscribe(tokenOrChannel: string | symbol) {
    if (this.redisSubscriber) {
      this.redisSubscriber.unsubscribe(
        tokenOrChannel as string,
        (err: Error | null | undefined) => {
          if (err) console.error('Redis unsubscribe failed:', err);
        },
      );
    } else {
      this.fallback.unsubscribe(tokenOrChannel as string);
    }
  }

  asyncIterator(channel: string) {
    const messageQueue: TODO[] = [];
    let isListening = true;

    const pushMessage = (message: TODO) => {
      messageQueue.push(message);
      if (resolveNext) {
        resolveNext(messageQueue.shift()!);
        resolveNext = null;
      }
    };

    let resolveNext: ((value: TODO) => void) | null = null;

    const cleanup = this.subscribe(channel, (message) => {
      if (isListening) {
        pushMessage(message);
      }
    });

    return {
      next: () => {
        return new Promise<{ value: TODO; done: boolean }>((resolve) => {
          if (messageQueue.length > 0) {
            resolve({ value: messageQueue.shift(), done: false });
          } else {
            resolveNext = resolve;
          }
        });
      },
      return: () => {
        isListening = false;
        if (typeof cleanup === 'function') {
          cleanup();
        }
        return Promise.resolve({ value: undefined, done: true });
      },
      throw: (error: TODO) => {
        isListening = false;
        if (typeof cleanup === 'function') {
          cleanup();
        }
        return Promise.reject(error);
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }
}

export const createPubSubInstance = (redis: RedisType) => new PubSub(redis);
