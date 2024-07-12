import { getModel } from 'base-backend';
import { SomeRequest } from '../../types';

export const passResetRequest = () =>
  getModel<SomeRequest>('passResetRequest', {
    email: {
      type: String,
    },
    key: {
      type: String,
    },
  });
