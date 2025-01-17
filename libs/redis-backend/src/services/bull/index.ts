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
import { SomeEnum } from '@the-libs/base-shared';

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

type PrevStage<
  Stages extends readonly string[],
  CurrentStage extends Stages[number],
> = Stages extends readonly [infer First, ...infer Rest]
  ? CurrentStage extends First
    ? never // No previous stage if CurrentStage is the first
    : Rest extends readonly string[]
      ? CurrentStage extends Rest[number]
        ? Stages[Rest extends readonly [...infer Previous, CurrentStage]
            ? Previous['length']
            : never]
        : never
      : never
  : never;

export interface BaseJob<
  StagesEnum extends readonly string[],
  TageIOMapping extends Record<
    StagesEnum[number],
    { Input: Record<string, unknown>; Output: Record<string, unknown> }
  >,
  CurrentStage extends StagesEnum[number],
> {
  testId: string;
  currentStage: CurrentStage;
  prevOutput: PrevStage<StagesEnum, CurrentStage> extends keyof TageIOMapping
    ? TageIOMapping[PrevStage<StagesEnum, CurrentStage>]['Output']
    : never;
}

interface StageServiceConfig<
  StagesEnum extends readonly string[],
  Stage extends StagesEnum[number],
  TageIOMapping extends Record<
    StagesEnum[number],
    { Input: Record<string, unknown>; Output: Record<string, unknown> }
  >,
> {
  stages: StagesEnum;
  stage: Stage;
  service: (
    taskData: BaseJob<StagesEnum, TageIOMapping, Stage>,
  ) => Promise<TageIOMapping[Stage]['Output']>;
}

export const runStageAsService = <
  StagesEnum extends readonly string[],
  Stage extends StagesEnum[number],
  TageIOMapping extends Record<
    StagesEnum[number],
    { Input: Record<string, unknown>; Output: Record<string, unknown> }
  >,
>(
  {
    stages,
    stage,
    service,
  }: StageServiceConfig<StagesEnum, Stage, TageIOMapping>,
  pubsub?: PubSub,
  STAGE_UPDATES_CHANNEL = 'DEFAULT_STAGE_UPDATES_CHANNEL',
) =>
  createAndAutoProcessQueue<BaseJob<StagesEnum, TageIOMapping, Stage>>(
    stage,
    async (job, done) => {
      try {
        const { testId, currentStage } = job.data;
        const stagesArray = Object.values(stages);
        const indexInStages = stages.indexOf(stage);

        const result = await service(job.data);

        if (currentStage !== stage)
          throw new Error(
            'Critical orchestration error - mismatch between ' +
              'currentStage: ' +
              currentStage +
              ' and stage: ' +
              stage,
          );

        await add(job.queue.name, {
          ...job.data,
          currentStage: stagesArray[indexInStages + 1],
          prevOutput: result,
        });

        pubsub?.publish(
          STAGE_UPDATES_CHANNEL,
          JSON.stringify({ id: testId, stage: currentStage }),
        );

        done();
      } catch (err) {
        console.error(err);
        job.failedReason = (err as Error).message;

        pubsub?.publish(
          STAGE_UPDATES_CHANNEL,
          JSON.stringify({
            id: job.data.testId,
            stage: job.data.currentStage,
            error: true,
          }),
        );

        done(err as Error);
      }
    },
  );
