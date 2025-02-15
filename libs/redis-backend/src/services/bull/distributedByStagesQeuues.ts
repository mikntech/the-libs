import { PubSub } from '../pubsub';
import { add, createAndAutoProcessQueue } from './simpeQueues';

type NextStage<
  StagesEnum extends Record<string, string>,
  CurrentStage,
> = CurrentStage extends keyof StagesEnum
  ? keyof {
      [K in keyof StagesEnum as StagesEnum[K] extends CurrentStage
        ? never
        : K]: StagesEnum[K];
    }
  : never;

export type InferStageIOMapping<
  StagesEnum extends Record<string, string>,
  InputMap extends Record<keyof StagesEnum, Record<string, unknown>>,
> = {
  [Stage in keyof StagesEnum]: {
    Input: InputMap[Stage];
    Output: NextStage<StagesEnum, Stage> extends keyof InputMap
      ? InputMap[NextStage<StagesEnum, Stage>]
      : null; // Last stage outputs `null`
  };
};

export interface BaseJob<
  StagesEnum extends Record<string, string>,
  StageIOMapping extends InferStageIOMapping<StagesEnum, InputMap>,
  CurrentStage extends keyof StagesEnum,
  InputMap extends Record<keyof StagesEnum, Record<string, unknown>>,
> {
  runId: string;
  currentStage: CurrentStage;
  stageData: StageIOMapping[CurrentStage]['Input'];
  prevOutput: StageIOMapping[CurrentStage]['Output'];
}

interface StageServiceConfig<
  StagesEnum extends Record<string, string>,
  Stage extends keyof StagesEnum,
  InputMap extends Record<keyof StagesEnum, Record<string, unknown>>,
  StageIOMapping extends InferStageIOMapping<StagesEnum, InputMap>,
> {
  stages: StagesEnum;
  stage: Stage;
  service: (
    taskData: StageIOMapping[Stage]['Input'], // Input inferred from StageIOMapping
  ) => Promise<StageIOMapping[Stage]['Output']>; // Output inferred dynamically
}

export const runStageAsService = <
  StagesEnum extends Record<string, string>,
  Stage extends keyof StagesEnum,
  InputMap extends Record<keyof StagesEnum, Record<string, unknown>>,
  StageIOMapping extends InferStageIOMapping<StagesEnum, InputMap>,
>(
  {
    stages,
    stage,
    service,
  }: StageServiceConfig<StagesEnum, Stage, InputMap, StageIOMapping>,
  pubsub?: PubSub,
  STAGE_UPDATES_CHANNEL = 'DEFAULT_STAGE_UPDATES_CHANNEL',
) =>
  createAndAutoProcessQueue<
    BaseJob<StagesEnum, StageIOMapping, Stage, InputMap>
  >(String(stage), async (job, done) => {
    const handleError = (err: Error) => {
      console.error(err);
      job.failedReason = err.message;
      pubsub?.publish(
        STAGE_UPDATES_CHANNEL,
        JSON.stringify({
          id: job.data.runId,
          stage: job.data.currentStage,
          error: true,
        }),
      );
      done(err);
    };
    try {
      const { runId, currentStage, stageData } = job.data;
      const stagesArray = Object.values(stages);
      const stageKeysArray = Object.keys(stages);
      const indexInStages = stagesArray.indexOf(String(stage));

      if (indexInStages === -1) {
        return handleError(
          new Error(
            `Critical orchestration error - stage '${String(stage)}' not found in stages.`,
          ),
        );
      }

      if (currentStage !== stage) {
        return handleError(
          new Error(
            `Critical orchestration error - mismatch between currentStage: ${String(currentStage)} and stage: ${String(stage)}.`,
          ),
        );
      }

      const result = await service(stageData);

      await add(job.queue.name, {
        ...job.data,
        currentStage: stageKeysArray[indexInStages + 1] || null,
        prevOutput: result,
      });

      pubsub?.publish(
        STAGE_UPDATES_CHANNEL,
        JSON.stringify({ id: runId, stage: currentStage }),
      );

      done();
    } catch (err) {
      handleError(err as Error);
    }
  });

export const startOrchestratedJob = <
  StagesEnum extends Record<string, string>,
  InputMap extends Record<keyof StagesEnum, Record<string, unknown>>,
  FirstStage extends keyof StagesEnum,
  StageIOMapping extends InferStageIOMapping<StagesEnum, InputMap>,
>(
  stages: StagesEnum,
  firstStageInput: StageIOMapping[FirstStage]['Input'], // First stage input
  service: (
    taskData: BaseJob<
      StagesEnum,
      StageIOMapping,
      FirstStage,
      InputMap
    >['stageData'],
  ) => Promise<StageIOMapping[FirstStage]['Output']>,
  pubsub?: PubSub,
  STAGE_UPDATES_CHANNEL = 'DEFAULT_STAGE_UPDATES_CHANNEL',
) => {
  const firstStage = Object.values(stages)[0] as FirstStage;
  runStageAsService<StagesEnum, FirstStage, InputMap, StageIOMapping>(
    {
      stages,
      stage: firstStage,
      service,
    },
    pubsub,
    STAGE_UPDATES_CHANNEL,
  );
  return add(String(firstStage), {
    runId: firstStageInput['runId'],
    currentStage: firstStage,
    stageData: firstStageInput,
    prevOutput: null,
  });
};
