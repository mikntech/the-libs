import { getModel } from '@the-libs/mongo-backend';
import { SomeRequest } from '@the-libs/auth-shared';
import { requestBasicSchema } from './index';

export const registrationRequest = (userTypeRelevant: boolean = false) =>
  getModel<SomeRequest<true>>(
    'registrationRequest',
    requestBasicSchema(userTypeRelevant),
  );
