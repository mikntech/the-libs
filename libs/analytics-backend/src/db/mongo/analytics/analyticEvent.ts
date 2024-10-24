import { getModel } from '@the-libs/mongo-backend';
import { SomeEnum } from '@the-libs/base-shared';

export const analyticEvent = <ENUM>(AnalyticEventEnum: SomeEnum<ENUM>) =>
  getModel<any>('avent', {
    value: {
      type: String,
      enum: Object.values(AnalyticEventEnum),
      required: true,
    },
    userNumber: {
      type: String,
    },
  });
