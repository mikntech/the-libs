import { getModel } from '../';
import { ErrorLog } from 'base-backend';

export const errorLog= () =>
  getModel<ErrorLog>('errorLog', {
    stringifiedError: {
      type: String,
    },
  });
