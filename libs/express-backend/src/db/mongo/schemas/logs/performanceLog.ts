import { getModel } from '@the-libs/mongo-backend';
import { PerformanceLog } from '@the-libs/base-shared';

export const performanceLog = () =>
  getModel<PerformanceLog>('performanceLog', {
    stringifiedLog: {
      type: String,
    },
  });
