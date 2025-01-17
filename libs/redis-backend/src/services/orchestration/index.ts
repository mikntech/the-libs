import { add, createAndAutoProcessQueue, createQueue, PubSub } from '@the-libs/redis-backend';

export interface BaseJob {
  testId: string;
}

interface JobType<TD> {
  currentStage: number;
  taskData: TD;
}

interface StageAsServiceConfig<TheEnum extends string, Datas, TD, R> {
  stage: TheEnum;
  indexInStages: number;
  service: (
    taskData: Datas[TheEnum]['StageInput'] & TD,
  ) => Promise<Datas[TheEnum]['StageOutput']>;
}

export const runStageAsService = <
  TheEnum extends string,
  Datas extends Record<
    TheEnum,
    { StageInput: Record<string, any>; StageOutput: Record<string, any> }
  >,
  TD extends BaseJob,
>(
  {
    stage,
    indexInStages,
    service,
  }: StageAsServiceConfig<TheEnum, Datas, TD, any>,
  pubsub?: PubSub,
  STAGE_UPDATES_CHANNEL = 'DEFAULT_STAGE_UPDATES_CHANNEL',
) => createAndAutoProcessQueue<JobType<TD>>(stage, async (job, done) => {
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

      await add((job.queue.name), {
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
};
