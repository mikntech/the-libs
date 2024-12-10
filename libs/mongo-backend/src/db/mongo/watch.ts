import type { ChangeStream, GenericListener } from 'mongodb';
import type { Document, Model } from 'mongoose';
import { TODO } from '@the-libs/base-shared';
import type { Db } from 'mongodb';

interface WatchCallback<T extends Document> {
  modelGetter: () => Promise<Model<T>>;
  event?: string; // defaults to 'change'
  handler: GenericListener;
}

export class WatchDB {
  private static ready: boolean = false;
  private static callbacks: WatchCallback<any>[] = [];
  private static activeWatches: Map<string, ChangeStream<any>> = new Map();
  private static wholeDBChangeStream: ChangeStream | null = null;

  static add(callback: WatchCallback<any>): void {
    this.callbacks.push(callback);
    this.ready && this.run();
  }

  static start(): void {
    this.ready = true;
    this.run();
  }

  static run(): void {
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

  /**
   * Watches the entire database for changes.
   * @param dbConnection The Mongoose database connection object.
   * @param handler The handler to call for database-wide events.
   * @param options Options for the change stream.
   */
  static async addToWholeDB(
    dbConnection: Db,
    handler: GenericListener,
    options?: TODO, // Replace TODO with the actual type for options if needed
  ): Promise<void> {
    if (this.wholeDBChangeStream) {
      console.warn('A database-wide change stream is already active.');
      return;
    }

    try {
      this.wholeDBChangeStream = dbConnection
        .watch([], options)
        .on('change', handler);
      console.log('Database-wide change stream started.');
    } catch (err) {
      console.error('Failed to start database-wide change stream:', err);
    }
  }

  /**
   * Cancels the database-wide change stream if it's active.
   */
  static cancelWholeDBWatch(): void {
    if (this.wholeDBChangeStream) {
      this.wholeDBChangeStream.close().then(() => {
        this.wholeDBChangeStream = null;
        console.log('Database-wide change stream canceled.');
      });
    } else {
      console.warn('No active database-wide change stream to cancel.');
    }
  }
}
