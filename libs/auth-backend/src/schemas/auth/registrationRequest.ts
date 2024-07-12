import { getModel } from 'base-backend';
import { SomeRequest } from '../../types';

export const registrationRequest = () =>
  getModel<SomeRequest>('registrationRequest', {
    email: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
  });
