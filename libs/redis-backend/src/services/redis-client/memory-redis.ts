import { EventEmitter } from 'events';

export class MemoryRedis extends EventEmitter {
  private store: Map<string, { value: string; expiry?: number }>;
  private pubsub: Map<string, Set<(channel: string, message: string) => void>>;
  public status: 'ready' | 'connecting' | 'reconnecting' | 'end';

  constructor() {
    super();
    this.store = new Map();
    this.pubsub = new Map();
    this.status = 'ready';
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: string, flag?: string, ttl?: number): Promise<'OK'> {
    const expiry = ttl ? Date.now() + (ttl * 1000) : undefined;
    this.store.set(key, { value, expiry });
    return 'OK';
  }

  async publish(channel: string, message: string): Promise<number> {
    const subscribers = this.pubsub.get(channel) || new Set();
    subscribers.forEach(callback => callback(channel, message));
    return subscribers.size;
  }

  async subscribe(channel: string, callback: (channel: string, message: string) => void): Promise<void> {
    if (!this.pubsub.has(channel)) {
      this.pubsub.set(channel, new Set());
    }
    this.pubsub.get(channel)!.add(callback);
  }

  async unsubscribe(channel: string, callback: (channel: string, message: string) => void): Promise<void> {
    const subscribers = this.pubsub.get(channel);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.pubsub.delete(channel);
      }
    }
  }

  async quit(): Promise<void> {
    this.store.clear();
    this.pubsub.clear();
    this.emit('end');
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Array.from(this.store.keys()).filter(key => regex.test(key));
  }

  async del(key: string): Promise<number> {
    const exists = this.store.has(key);
    this.store.delete(key);
    return exists ? 1 : 0;
  }
} 