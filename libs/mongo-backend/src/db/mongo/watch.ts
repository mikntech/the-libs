import type { ChangeStream, GenericListener } from 'mongodb';
import type { Document, Model } from 'mongoose';
import { TODO } from '@the-libs/base-shared';
import type { Db } from 'mongodb';

interface WatchCallback<T extends Document> {
  modelGetter: () => Promise<Model<T>>;
  event?: string;
  handler: GenericListener;
}

export class WatchDB {
  private static ready: boolean = false;
  private static callbacks: WatchCallback<any>[] = [];
  private static activeWatches: Map<string, ChangeStream<any>> = new Map();
  private static wholeDBChangeStream: ChangeStream | null = null;

  /**
   * Registers a model-specific change stream.
   * Prevents duplicate streams and handles reconnection.
   */
  static add(callback: WatchCallback<any>): void {
    this.callbacks.push(callback);
    if (this.ready) {
      this.run();
    }
  }

  /**
   * Starts all registered change streams if not already started.
   */
  static start(): void {
    if (!this.ready) {
      this.ready = true;
      this.run();
    }
  }

  /**
   * Initializes all registered change streams with reconnection logic.
   */
  static run(): void {
    this.callbacks.forEach(async ({ modelGetter, event, handler }) => {
      try {
        const model = await modelGetter();
        const { collectionName } = model.collection;

        // Close existing stream before re-watching
        if (this.activeWatches.has(collectionName)) {
          const oldStream = this.activeWatches.get(collectionName);
          await oldStream?.close();
        }

        // Create new change stream with error handling
        const changeStream = model.watch().on(event ?? 'change', handler);

        // ✅ Error Handling for ChangeStream Issues
        changeStream.on('error', (error) => {
          if (error.message.includes('ChangeStream is closed')) {
            setTimeout(() => this.run(), 5000); // Restart the stream
          }
        });

        changeStream.on('close', () => {
          setTimeout(() => this.run(), 5000);
        });

        this.activeWatches.set(collectionName, changeStream);
      } catch (error) {}
    });
  }

  /**
   * Watches the entire MongoDB database with error handling.
   */
  static addToWholeDB(
    dbConnection: Db,
    handler: GenericListener,
    options?: TODO,
  ): void {
    if (this.wholeDBChangeStream) {
      return;
    }

    try {
      this.wholeDBChangeStream = dbConnection
        .watch([], options)
        .on('change', handler);

      // ✅ Error Handling for WholeDB ChangeStream
      this.wholeDBChangeStream.on('error', (error) => {
        if (error.message.includes('ChangeStream is closed')) {
          setTimeout(
            () => this.addToWholeDB(dbConnection, handler, options),
            5000,
          );
        }
      });

      this.wholeDBChangeStream.on('close', () => {
        setTimeout(
          () => this.addToWholeDB(dbConnection, handler, options),
          5000,
        );
      });
    } catch (err) {}
  }

  /**
   * Cancels the entire database change stream safely.
   */
  static async cancelWholeDBWatch(): Promise<void> {
    if (this.wholeDBChangeStream) {
      await this.wholeDBChangeStream.close();
      this.wholeDBChangeStream = null;
    } else {
    }
  }
}
