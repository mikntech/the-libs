import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Types } = require('mongoose');
import { getModel } from '@the-libs/mongo-backend';
import { OTP } from '@the-libs/auth-shared';

export default async () =>
  getModel<OTP>('otp', {
    user: {
      type: Types.ObjectId,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
  });
