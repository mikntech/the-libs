import { getModel } from 'gbase-b';
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
