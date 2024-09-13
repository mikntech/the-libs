import { getModel } from '@the-libs/mongo-backend';
import { SomeRequest } from '@the-libs/auth-shared';
import { requestBasicSchema } from './index';

export const passResetRequest = (userTypeRelevant: boolean = false) =>
  getModel<SomeRequest<true>>(
    'passResetRequest',
    requestBasicSchema(userTypeRelevant),
  );
