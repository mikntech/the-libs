import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { JobOptions, ProcessCallbackFunction, Queue } from 'bull';
const BullClass = require('bull');
import { redisSettings } from '../../config';

export const createQueue = <DATA>(
  queueName: string,
  howToProcess: ProcessCallbackFunction<DATA>,
) => {
  const queue = new BullClass(queueName, { redis: redisSettings.uri });
  queue.process(howToProcess);
  return queue;
};

export const add = <DATA>(queue: Queue<DATA>, data: DATA, opts?: JobOptions) =>
  queue.add(data, opts);
