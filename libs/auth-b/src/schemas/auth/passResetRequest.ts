import { getModel } from 'gbase-b';
import { PassResetRequest } from '../../types';

export const passResetRequest= () =>
  getModel<PassResetRequest>('passResetRequest', {
    email: {
      type: String,
    },
    key: {
      type: String,
    },
  });
