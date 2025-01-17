import { createAndAutoProcessQueue, PubSub } from '@the-libs/redis-backend';

export interface BaseJob {
  testId: string;
}

interface JobType<TD> {
  currentStage: number;
  taskData: TD;
}

interface StageAsServiceConfig<TheEnum, TD> {
  stage: TheEnum;
  indexInStages: number;
  service: (taskData?: JobType<TD>['taskData']) => Promise<void>;
}

const runStageAsService = <TheEnum extends string, TD extends BaseJob>(
  { stage, indexInStages, service }: StageAsServiceConfig<TheEnum, TD>,
  pubsub?: PubSub,
  STAGE_UPDATES_CHANNEL = 'DEFAULT_STAGE_UPDATES_CHANNEL',
) =>
  createAndAutoProcessQueue<JobType<TD>>(stage, async (job, done) => {
    try {
      const { taskData, currentStage } = job.data;
      if (currentStage !== indexInStages)
        throw new Error(
          'There is a critical orchestration error - mismatch between ' +
            currentStage +
            ': ' +
            currentStage +
            ' and MY_INDEX: ' +
            indexInStages,
        );
      await service(taskData);
      done();
    } catch (err: any) {
      console.log(err);
      job.failedReason = err;
      done(err);
      pubsub?.publish(
        STAGE_UPDATES_CHANNEL,
        JSON.stringify({
          id: job.data.taskData.testId,
          stage: job.data.currentStage,
          error: true,
        }),
      );
    }
  });
