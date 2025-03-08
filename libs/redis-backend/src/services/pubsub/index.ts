import NodePubSub from 'pubsub-js';
import { RedisType } from '../redis-client';

export class PubSub {
  private readonly redisSubscriber: RedisType | null | any;
  private readonly redisPublisher: RedisType | null;
  private readonly fallback: typeof NodePubSub;
  public activeSubscriptions: Map<
    string,
    {
      messageListeners: Set<(message: string) => void>;
      cleanup: () => void;
    }
  >;
  private readonly patternSubscriptions: Map<
    string,
    {
      messageListeners: Set<(channel: string, message: string) => void>;
      cleanup: () => void;
    }
  >;

  constructor(pub: RedisType, sub: RedisType) {
    this.redisSubscriber = sub;
    this.redisPublisher = pub;
    this.fallback = NodePubSub;
    this.activeSubscriptions = new Map();
    this.patternSubscriptions = new Map();
    this.redisSubscriber?.setMaxListeners(50);
  }

  subscribe(channel: string, callback: (message: string) => void): () => void {
    if (!this.activeSubscriptions.has(channel)) {
      console.log(`Subscribing to new channel: ${channel}`);

      const messageListeners = new Set<(message: string) => void>();
      const messageListener = (subscribedChannel: string, message: string) => {
        if (subscribedChannel === channel) {
          for (const cb of messageListeners) {
            cb(message);
          }
        }
      };

      const cleanup = () => {
        console.log(`Cleaning up subscription for ${channel}`);
        this.redisSubscriber?.unsubscribe(channel, (err: Error) => {
          if (err) console.error('Redis unsubscription failed:', err);
        });
        this.redisSubscriber?.off('message', messageListener);
        this.activeSubscriptions.delete(channel);
      };

      this.redisSubscriber?.subscribe(channel, (err: Error) => {
        if (err) console.error('Redis subscription failed:', err);
      });

      this.redisSubscriber?.on('message', messageListener);

      this.activeSubscriptions.set(channel, { messageListeners, cleanup });
    }

    const subscription = this.activeSubscriptions.get(channel)!;
    subscription.messageListeners.add(callback);

    return () => {
      subscription.messageListeners.delete(callback);

      if (subscription.messageListeners.size === 0) {
        subscription.cleanup();
      }
    };
  }

  publish(channel: string, message: string) {
    if (this.redisPublisher) {
      this.redisPublisher.publish(channel, message, (err: any) => {
        if (err) console.error('Redis publish failed:', err);
      });
    } else {
      this.fallback.publish(channel, message);
    }
  }

  unsubscribe(tokenOrChannel: string | symbol) {
    if (this.redisSubscriber) {
      this.redisSubscriber.unsubscribe(
        tokenOrChannel as string,
        (err: Error) => {
          if (err) console.error('Redis unsubscribe failed:', err);
        },
      );
    } else {
      this.fallback.unsubscribe(tokenOrChannel as string);
    }
  }

  subscribeToAll(
    callback: (channel: string, message: string) => void,
  ): () => void {
    console.log(`Subscribing to all channels`);

    const messageListeners = new Set<
      (channel: string, message: string) => void
    >();
    const messageListener = (
      pattern: string,
      channel: string,
      message: string,
    ) => {
      for (const cb of messageListeners) {
        cb(channel, message);
      }
    };

    const cleanup = () => {
      console.log(`Cleaning up global subscription`);
      this.redisSubscriber?.punsubscribe('*', (err: Error) => {
        if (err) console.error('Redis punsubscription failed:', err);
      });
      this.redisSubscriber?.off('pmessage', messageListener);
    };

    this.redisSubscriber?.psubscribe('*', (err: Error) => {
      if (err) console.error('Redis pattern subscription failed:', err);
    });

    this.redisSubscriber?.on('pmessage', messageListener);

    messageListeners.add(callback);

    return () => {
      messageListeners.delete(callback);
      if (messageListeners.size === 0) {
        cleanup();
      }
    };
  }

  psubscribe(
    pattern: string,
    callback: (channel: string, message: string) => void,
  ): () => void {
    if (!this.patternSubscriptions.has(pattern)) {
      console.log(`Pattern subscribing to: ${pattern}`);

      const messageListeners = new Set<
        (channel: string, message: string) => void
      >();
      const messageListener = (
        matchedPattern: string,
        channel: string,
        message: string,
      ) => {
        if (matchedPattern === pattern) {
          for (const cb of messageListeners) {
            cb(channel, message);
          }
        }
      };

      const cleanup = () => {
        console.log(`Cleaning up pattern subscription for ${pattern}`);
        this.redisSubscriber?.punsubscribe(pattern, (err: Error) => {
          if (err) console.error('Redis pattern unsubscription failed:', err);
        });
        this.redisSubscriber?.off('pmessage', messageListener);
        this.patternSubscriptions.delete(pattern);
      };

      this.redisSubscriber?.psubscribe(pattern, (err: Error) => {
        if (err) console.error('Redis pattern subscription failed:', err);
      });

      this.redisSubscriber?.on('pmessage', messageListener);

      this.patternSubscriptions.set(pattern, { messageListeners, cleanup });
    }

    const subscription = this.patternSubscriptions.get(pattern)!;
    subscription.messageListeners.add(callback);

    return () => {
      subscription.messageListeners.delete(callback);
      if (subscription.messageListeners.size === 0) {
        subscription.cleanup();
      }
    };
  }

  punsubscribe(pattern: string) {
    if (this.redisSubscriber) {
      this.redisSubscriber.punsubscribe(pattern, (err: Error) => {
        if (err) console.error('Redis pattern unsubscribe failed:', err);
      });
    }
  }

  asyncIterator(channel: string) {
    const messageQueue: string[] = [];
    let isListening = true;

    const pushMessage = (message: string) => {
      messageQueue.push(message);
      if (resolveNext) {
        resolveNext({ value: messageQueue.shift()!, done: false });
        resolveNext = null;
      }
    };

    let resolveNext:
      | ((value: { value: string; done: boolean }) => void)
      | null = null;

    const cleanup = this.subscribe(channel, (message) => {
      if (isListening) {
        pushMessage(message);
      }
    });

    return {
      next: () => {
        return new Promise<{ value: string; done: boolean }>((resolve) => {
          if (messageQueue.length > 0) {
            resolve({ value: messageQueue.shift()!, done: false });
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
      throw: (error: any) => {
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
