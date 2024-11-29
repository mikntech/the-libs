import { getModel } from '@the-libs/mongo-backend';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Types } = require('mongoose');

export const userRef = () =>
  getModel<any>('userRef', {
    user: {
      type: Types.ObjectId,
      required: true,
    },
    ref: {
      type: Types.ObjectId,
      required: true,
    },
  });
