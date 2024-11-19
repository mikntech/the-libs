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
) =>
  new BullClass(queueName, { redis: redisSettings.uri }).process(
    howToProcess,
    OnDone,
  );

export const add = <DATA>(queue: Queue<DATA>, data: DATA, opts?: JobOptions) =>
  queue.add(data, opts);
