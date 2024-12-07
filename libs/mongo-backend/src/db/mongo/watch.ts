import type { ChangeStream, GenericListener } from 'mongodb';
import type { Document, Model } from 'mongoose';
import { TODO } from '@the-libs/base-shared';

interface WatchCallback<T extends Document> {
  modelGetter: () => Promise<Model<T>>;
  event?: string; // defaults to 'change'
  handler: GenericListener;
}

export class WatchDB {
  private static ready: boolean = false;
  private static callbacks: WatchCallback<any>[] = [];
  private static activeWatches: Map<string, ChangeStream<any>> = new Map();

  static add(callback: WatchCallback<any>): void {
    this.callbacks.push(callback);
    this.ready && this.run();
  }

  static start() {
    this.ready = true;
    this.run();
  }

  static run() {
    this.callbacks.forEach(({ modelGetter, event, handler }) => {
      const modelPromise = modelGetter();
      modelPromise.then((model) => {
        const changeStream = model.watch().on(event ?? 'change', handler);
        const { collectionName } = model.collection;
        if (!this.activeWatches.has(collectionName)) {
          this.activeWatches.set(collectionName, changeStream as TODO);
        } else {
          const oldStream = this.activeWatches.get(collectionName);
          oldStream?.close().then();
          this.activeWatches.set(collectionName, changeStream as TODO);
        }
      });
    });
  }
}
