import NodePubSub from 'pubsub-js';
import { createRedisInstance, RedisType } from '../redis-client';

export class PubSub {
  private redisClient: RedisType | null;
  private fallback: typeof NodePubSub;

  constructor() {
    // Create a single Redis instance or fallback to NodePubSub if Redis is unavailable
    this.redisClient = createRedisInstance();
    this.fallback = NodePubSub;
  }

  /**
   * Subscribe to a channel. Uses Redis if available, otherwise falls back to NodePubSub.
   * @param channel - The channel to subscribe to
   * @param callback - The callback function to call when a message is received
   * @returns Subscription token if using fallback; otherwise, void.
   */
  subscribe(
    channel: string,
    callback: (message: string) => void,
  ): string | (() => void) | void {
    if (this.redisClient) {
      this.redisClient.subscribe(channel, (err: Error | null | undefined) => {
        if (err) console.error('Redis subscription failed:', err);
      });

      const messageListener = (subscribedChannel: string, message: string) => {
        if (subscribedChannel === channel) {
          callback(message);
        }
      };

      // Bind message listener to Redis client
      this.redisClient.on('message', messageListener);

      // Return a cleanup function to unsubscribe and remove the listener
      return () => {
        this.redisClient?.unsubscribe(
          channel,
          (err: Error | null | undefined) => {
            if (err) console.error('Redis unsubscription failed:', err);
          },
        );
        this.redisClient?.off('message', messageListener);
      };
    } else {
      // Use fallback and return the subscription token
      return this.fallback.subscribe(channel, (msg, data) => callback(data));
    }
  }

  /**
   * Publish a message to a channel. Uses Redis if available, otherwise falls back to NodePubSub.
   * @param channel - The channel to publish to
   * @param message - The message to publish
   */
  publish(channel: string, message: string) {
    if (this.redisClient) {
      this.redisClient.publish(
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

  /**
   * Unsubscribe from a channel.
   * @param tokenOrChannel - The subscription token or channel to unsubscribe from
   */
  unsubscribe(tokenOrChannel: string | symbol) {
    if (this.redisClient) {
      this.redisClient.unsubscribe(
        tokenOrChannel as string,
        (err: Error | null | undefined) => {
          if (err) console.error('Redis unsubscribe failed:', err);
        },
      );
    } else {
      this.fallback.unsubscribe(tokenOrChannel as string);
    }
  }

  /**
   * Provides an AsyncIterator for a specific channel to use in GraphQL subscriptions.
   * @param channel - The channel to listen to
   * @returns An AsyncIterator that yields messages as they arrive
   */
  // asyncIterator method inside PubSub class
  asyncIterator(channel: string) {
    const messageQueue: any[] = [];
    let isListening = true;

    const pushMessage = (message: any) => {
      messageQueue.push(message);
      if (resolveNext) {
        resolveNext(messageQueue.shift()!);
        resolveNext = null;
      }
    };

    let resolveNext: ((value: any) => void) | null = null;

    // Capture the result of subscribe, which may be a function or string
    const cleanup = this.subscribe(channel, (message) => {
      if (isListening) {
        pushMessage(message);
      }
    });

    return {
      next: () => {
        return new Promise<{ value: any; done: boolean }>((resolve) => {
          if (messageQueue.length > 0) {
            resolve({ value: messageQueue.shift(), done: false });
          } else {
            resolveNext = resolve;
          }
        });
      },
      return: () => {
        isListening = false;
        // Check if cleanup is a function before calling it
        if (typeof cleanup === 'function') {
          cleanup();
        }
        return Promise.resolve({ value: undefined, done: true });
      },
      throw: (error: any) => {
        isListening = false;
        // Check if cleanup is a function before calling it
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
