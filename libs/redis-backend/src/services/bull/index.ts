import { createRequire } from 'module';
import type {
  Job,
  JobOptions,
  JobStatus,
  ProcessCallbackFunction,
  Queue,
} from 'bull';
const require = createRequire(import.meta.url);
const BullClass = require('bull');
import { redisSettings } from '../../config';

const queues = new Map<string, Queue>(); // Store created queues to ensure reuse

/**
 * Create or reuse a Bull queue.
 * @param queueName The name of the queue.
 * @returns The created or reused queue instance.
 */
export const createQueue = <DATA>(queueName: string): Queue<DATA> => {
  if (!queues.has(queueName)) {
    const queue = new BullClass(queueName + '{shared}', {
      redis: redisSettings.uri,
    });
    queues.set(queueName, queue);
  }
  return queues.get(queueName) as Queue<DATA>;
};

/**
 * Create a queue and process its jobs automatically.
 * @param queueName The name of the queue.
 * @param howToProcess The function to process jobs.
 * @param concurrency The number of concurrent job processors.
 * @param sucCB Optional success callback.
 * @param errCb Optional error callback.
 * @returns The created queue instance.
 */
export const createAndAutoProcessQueue = <DATA>(
  queueName: string,
  howToProcess: ProcessCallbackFunction<DATA>,
  concurrency = 10,
  sucCB?: () => any,
  errCb?: (err: Error) => any,
): Queue<DATA> => {
  const queue = createQueue<DATA>(queueName);

  try {
    queue.process(concurrency, howToProcess).then(sucCB).catch(errCb);
  } catch (error) {
    console.error(`[${queueName}] Critical error in queue processing:`, error);
    if (errCb) errCb(error as Error);
  }

  return queue;
};

/**
 * Add a job to a Bull queue.
 * @param queue The queue instance.
 * @param data The data for the job.
 * @param opts Optional job options.
 * @returns The created job.
 */
export const add = <DATA>(queue: Queue<DATA>, data: DATA, opts?: JobOptions) =>
  queue.add(data, opts);

/**
 * Attach a job processing function to a queue.
 * @param queue The queue instance.
 * @param howToProcess The function to process jobs.
 * @param concurrency The number of concurrent job processors.
 * @param sucCB Optional success callback.
 * @param errCb Optional error callback.
 * @returns A promise for the process operation.
 */
export const process = <DATA>(
  queue: Queue<DATA>,
  howToProcess: ProcessCallbackFunction<DATA>,
  concurrency = 10,
  sucCB?: () => any,
  errCb?: (err: Error) => any,
): Promise<void> =>
  queue.process(concurrency, howToProcess).then(sucCB).catch(errCb);

/**
 * Check the status of jobs in a queue and apply custom logic.
 * @param queue The queue instance.
 * @param customLogic The function to apply custom logic on job statuses.
 * @returns The result of the custom logic.
 */
export const checkStatus = async <DATA, R>(
  queue: Queue<DATA>,
  customLogic: (
    allJobs: Job<DATA>[],
    possibleStatuses: JobStatus[],
  ) => Promise<R>,
): Promise<R | null> => {
  try {
    const possibleStatuses: JobStatus[] = [
      'completed',
      'waiting',
      'active',
      'delayed',
      'failed',
      'paused',
    ];
    const allJobs = await queue.getJobs(possibleStatuses);
    return await customLogic(allJobs, possibleStatuses);
  } catch (error) {
    console.error(`[${queue.name}] Error checking queue status:`, error);
    return null;
  }
};

/**
 * Gracefully shutdown all queues and their Redis connections.
 */
export const shutdownQueues = async (): Promise<void> => {
  for (const [queueName, queue] of queues) {
    try {
      await queue.close();
      console.log(`[${queueName}] Queue connection closed.`);
    } catch (error) {
      console.error(`[${queueName}] Error closing queue connection:`, error);
    }
  }
};

(process as any).on('SIGINT', async () => {
  console.log('Shutting down queues...');
  await shutdownQueues();
  (process as any).exit();
});

(process as any).on('SIGTERM', async () => {
  console.log('Shutting down queues...');
  await shutdownQueues();
  (process as any).exit();
});
