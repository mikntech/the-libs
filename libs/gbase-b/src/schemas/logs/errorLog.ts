import { getModel } from '../';
import { ErrorLog } from '../../types/schemas/logs';

export default () =>
  getModel<ErrorLog>('errorLog', {
    stringifiedError: {
      type: String,
    },
  });
