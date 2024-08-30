import { getModel } from '../index';
import { ErrorLog } from '@base-shared';

export const errorLog = () =>
  getModel<ErrorLog>('errorLog', {
    stringifiedError: {
      type: String,
    },
  });
