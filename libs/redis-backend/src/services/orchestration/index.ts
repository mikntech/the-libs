import {
  add,
  createAndAutoProcessQueue,
  PubSub,
} from '@the-libs/redis-backend';

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
