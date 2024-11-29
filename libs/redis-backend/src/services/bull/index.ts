import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import type {
  Job,
  JobOptions,
  JobStatus,
  ProcessCallbackFunction,
  Queue,
} from 'bull';
const BullClass = require('bull');
import { redisSettings } from '../../config';

export const createQueue = <DATA>(
  queueName: string,
  howToProcess: ProcessCallbackFunction<DATA>,
) => {
  const queue: Queue<DATA> = new BullClass(queueName, {
    redis: redisSettings.uri,
  });
  queue.process(howToProcess).then();
  return queue;
};

export const add = <DATA>(queue: Queue<DATA>, data: DATA, opts?: JobOptions) =>
  queue.add(data, opts);

export const checkStatus = async <DATA, R>(
  queue: Queue<DATA>,
  customLogic: (
    allJobs: Job<DATA>[],
    possibleStatuses: JobStatus[],
  ) => Promise<R>,
) => {
  const possibleStatuses: JobStatus[] = [
    'completed',
    'waiting',
    'active',
    'delayed',
    'failed',
    'paused',
  ];
  const allJobs = await queue.getJobs(possibleStatuses);
  return customLogic(allJobs, possibleStatuses);
};
