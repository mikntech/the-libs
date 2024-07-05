import { getModel } from 'gbase-b';
import { PassResetRequest } from '../../types';

export default () =>
  getModel<PassResetRequest>('passResetRequest', {
    email: {
      type: String,
    },
    key: {
      type: String,
    },
  });
