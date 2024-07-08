import { getModel } from '../';
import { ErrorLog } from 'base-backend';

export default () =>
  getModel<ErrorLog>('errorLog', {
    stringifiedError: {
      type: String,
    },
  });
