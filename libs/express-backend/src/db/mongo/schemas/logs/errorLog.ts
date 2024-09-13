import { getModel } from '../index';
import { ErrorLog } from '@the-libs/base-shared';

export const errorLog = () =>
  getModel<ErrorLog>('errorLog', {
    stringifiedError: {
      type: String,
    },
  });
