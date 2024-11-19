import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import {
  DoneCallback,
  Job,
  JobOptions,
  ProcessCallbackFunction,
  Queue,
} from 'bull';
const BullClass = require('bull');
import { redisSettings } from '../../config';

export const createQueue = <DATA>(
  queueName: string,
  howToProcess: ProcessCallbackFunction<DATA>,
  OnDone?: (job: Job<DATA>, done: DoneCallback) => void,
) => {
  const queue = new BullClass(queueName, { redis: redisSettings.uri });
  queue.process(howToProcess, OnDone);
  return queue;
};

export const add = <DATA>(queue: Queue<DATA>, data: DATA, opts?: JobOptions) =>
  queue.add(data, opts);
