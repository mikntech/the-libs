import { getModel } from '@the-libs/mongo-backend';
import { SomeEnum } from '@the-libs/base-shared';

export const analyticEvent = <ENUM>(
  AnalyticEventEnum?: SomeEnum<ENUM>,
  enforceValues = false,
) =>
  getModel<any>('analyticEvent', {
    value: {
      type: String,
      ...(enforceValues && AnalyticEventEnum
        ? {
            enum: Object.values(AnalyticEventEnum).filter(
              (v): v is string => typeof v === 'string',
            ),
          }
        : {}),
      required: true,
    },
    userEmail: {
      type: String,
    },
    userNumber: {
      type: String,
    },
    sessionId: {
      type: String,
    },
    custom: {
      type: String,
    },
  });
