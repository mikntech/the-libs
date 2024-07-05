import { getModel } from '..';
import user from '../../abstract/user';
import { Admin, AdminRole } from '@cube-box/shared';

export default () =>
  getModel<Admin>('admin', {
    ...user,
    role: { type: String, enum: Object.values(AdminRole), required: true },
  });
