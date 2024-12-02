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

export const createQueue = <DATA>(queueName: string): Queue<DATA> =>
  new BullClass(queueName + '{shared}', {
    redis: redisSettings.uri,
  });

export const createAndAutoProcessQueue = <DATA>(
  queueName: string,
  howToProcess: ProcessCallbackFunction<DATA>,
  sucCB?: () => any,
  errCb?: () => any,
) => {
  const queue: Queue<DATA> = createQueue(queueName);
  queue.process(howToProcess).then(sucCB).catch(errCb);
  return queue;
};

export const add = <DATA>(queue: Queue<DATA>, data: DATA, opts?: JobOptions) =>
  queue.add(data, opts);

export const process = <DATA>(
  queue: Queue<DATA>,
  howToProcess: ProcessCallbackFunction<DATA>,
  sucCB?: () => any,
  errCb?: () => any,
) => queue.process(howToProcess).then(sucCB).catch(errCb);

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
