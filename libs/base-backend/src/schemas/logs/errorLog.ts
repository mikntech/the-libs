import { getModel } from '../index';
import { ErrorLog } from '../../../../base-shared/src/types';

export const errorLog = () =>
  getModel<ErrorLog>('errorLog', {
    stringifiedError: {
      type: String,
    },
  });
