import { getModel } from '..';
import user from '../../abstract/user';
import { Contractor, ContractorRole } from '@cube-box/shared';

export default () =>
  getModel<Contractor>('contractor', {
    ...user,
    role: { type: String, enum: Object.values(ContractorRole), required: true },
  });
