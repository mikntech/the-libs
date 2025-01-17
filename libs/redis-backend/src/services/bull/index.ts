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
import { PubSub } from '../pubsub';

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

export const createAndAdd = <DATA>(
  queueName: string,
  data: DATA,
  opts?: JobOptions,
) => createQueue<DATA>(queueName).add(data, opts);

/**
 * Add a job to a Bull queue.
 * @param queueOrName The queue instance, or its name.
 * @param data The data for the job.
 * @param opts Optional job options.
 * @returns The created job.
 */
export const add = <DATA>(
  queueOrName: Queue<DATA> | string,
  data: DATA,
  opts?: JobOptions,
) =>
  typeof queueOrName === 'string'
    ? createAndAdd(queueOrName, data, opts)
    : queueOrName.add(data, opts);

/**
 * Attach a job processing function to a queue.
 * @param queue The queue instance.
 * @param howToProcess The function to process jobs.
 * @param concurrency The number of concurrent job processors.
 * @param sucCB Optional success callback.
 * @param errCb Optional error callback.
 * @returns A promise for the process operation.
 */
export const processQueue = <DATA>(
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

/**
 * Handle SIGINT and SIGTERM signals for graceful shutdown.
 */
const handleShutdownSignal = async (signal: string) => {
  console.log(`Received ${signal}, shutting down queues...`);
  await shutdownQueues();
  process.exit();
};

// Register signal handlers
process.on('SIGINT', () => handleShutdownSignal('SIGINT'));
process.on('SIGTERM', () => handleShutdownSignal('SIGTERM'));

export interface BaseJob {
  testId: string;
}

interface JobType<TD> {
  currentStage: number;
  taskData: TD;
}

interface StageServiceConfig<
  StageKey extends string,
  StageMapping extends Record<
    string,
    { Input: Record<string, any>; Output: Record<string, any> }
  >,
  TD extends BaseJob,
> {
  stage: StageKey;
  indexInStages: number;
  service: (
    taskData: StageMapping[StageKey]['Input'] & TD,
  ) => Promise<StageMapping[StageKey]['Output']>;
}

export const runStageAsService = <
  StageKey extends keyof StageMapping & string,
  StageMapping extends Record<
    string,
    { Input: Record<string, any>; Output: Record<string, any> }
  >,
  TD extends BaseJob,
>(
  {
    stage,
    indexInStages,
    service,
  }: StageServiceConfig<StageKey, StageMapping, TD>,
  pubsub?: PubSub,
  STAGE_UPDATES_CHANNEL = 'DEFAULT_STAGE_UPDATES_CHANNEL',
) =>
  createAndAutoProcessQueue<JobType<TD>>(stage, async (job, done) => {
    try {
      const { taskData, currentStage } = job.data;
      if (currentStage !== indexInStages)
        throw new Error(
          'Critical orchestration error - mismatch between ' +
            'currentStage: ' +
            currentStage +
            ' and MY_INDEX: ' +
            indexInStages,
        );

      const result = await service(taskData);

      await add(job.queue.name, {
        ...taskData,
        currentStage: currentStage + 1,
        prevRes: result,
      });

      pubsub?.publish(
        STAGE_UPDATES_CHANNEL,
        JSON.stringify({ id: taskData.testId, stage: currentStage }),
      );

      done();
    } catch (err: any) {
      console.error(err);
      job.failedReason = err.message;

      pubsub?.publish(
        STAGE_UPDATES_CHANNEL,
        JSON.stringify({
          id: job.data.taskData.testId,
          stage: job.data.currentStage,
          error: true,
        }),
      );

      done(err);
    }
  });
