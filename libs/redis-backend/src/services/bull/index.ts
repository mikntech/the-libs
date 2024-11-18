import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import type { JobOptions, ProcessCallbackFunction, Queue } from 'bull';
const BullClass = require('bull');
import { redisSettings } from '../../config';

export const createQueue = (queueName: string) =>
  new BullClass(queueName, { redis: redisSettings.uri });

export const add = <DATA>(queue: Queue<DATA>, data: DATA, opts?: JobOptions) =>
  queue.add(data, opts);

export const process = <DATA>(
  queue: Queue<DATA>,
  cb: ProcessCallbackFunction<DATA>,
) => queue.process(cb);
