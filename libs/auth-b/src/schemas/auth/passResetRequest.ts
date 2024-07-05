import { getModel } from '..';
import { AccountType, PassResetRequest } from '@cube-box/shared';

export default () =>
  getModel<PassResetRequest>('passResetRequest', {
    email: {
      type: String,
    },
    accountType: {
      type: String,
      enum: Object.values(AccountType),
      required: true,
    },
    key: {
      type: String,
    },
  });
