import { getModel } from 'base-backend';
import { RegistrationRequest } from '../../types';

export  const registrationRequest=() =>
  getModel<RegistrationRequest>('registrationRequest', {
    email: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
  });
