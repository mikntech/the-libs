import { getModel } from '..';
import user from '../../abstract/user';
import { Schema } from 'mongoose';
import { Customer } from '@cube-box/shared';

export default () =>
  getModel<Customer>('customer', {
    ...user,
    apartment_interests_ids: { type: [Schema.Types.ObjectId] },
  });
