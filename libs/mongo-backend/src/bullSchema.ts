import { DBDoc, getModel } from './index';

interface JobStageData extends DBDoc {
  stringifiedData: string;
}

export const getJobStageDataModel = () =>
  getModel<JobStageData, never>('jobStageData', {
    stringifiedData: String,
  });
