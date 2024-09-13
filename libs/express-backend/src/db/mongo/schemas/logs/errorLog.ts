import { getModel } from '@the-libs/mongo-backend';
import { ErrorLog } from '@the-libs/base-shared';

export const errorLog = () =>
  getModel<ErrorLog>('errorLog', {
    stringifiedError: {
      type: String,
    },
  });
