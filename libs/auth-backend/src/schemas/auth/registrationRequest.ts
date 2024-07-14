import { getModel } from 'base-backend';
import { SomeRequest } from '../../types';
import { requestBasicSchema } from '../../abstract';

export const registrationRequest = (userTypeRelevant: boolean = false) =>
  getModel<SomeRequest<true>>(
    'registrationRequest',
    requestBasicSchema(userTypeRelevant),
  );
