import { getModel } from 'base-backend';
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
