import { getModel } from '@the-libs/base-backend';
import { SomeRequest } from '../../../../types';
import { requestBasicSchema } from './index';

export const passResetRequest = (userTypeRelevant: boolean = false) =>
  getModel<SomeRequest<true>>(
    'passResetRequest',
    requestBasicSchema(userTypeRelevant),
  );
