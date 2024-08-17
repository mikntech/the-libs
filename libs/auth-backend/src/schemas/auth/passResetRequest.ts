import { getModel } from '@base-backend';
import { SomeRequest } from '../../types';
import { requestBasicSchema } from '.';

export const passResetRequest = (userTypeRelevant: boolean = false) =>
  getModel<SomeRequest<true>>(
    'passResetRequest',
    requestBasicSchema(userTypeRelevant),
  );
