import { getModel } from '..';
import { AccountType, RegistrationRequest } from '@cube-box/shared';

export default () =>
  getModel<RegistrationRequest>('registrationRequest', {
    email: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: Object.values(AccountType),
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
  });
