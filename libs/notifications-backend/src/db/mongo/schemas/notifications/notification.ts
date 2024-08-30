import { Types } from 'mongoose';
import { getModel } from '@base-backend';
import { Notification } from '@notifications-shared';
import { Rules } from '@offisito-shared';

export default () =>
  getModel<Notification>('notification', {
    rule: { type: Types.ObjectId, ref: 'notificationRule', required: true },
    key: {
      type: String,
      enum: [...Object.keys(Rules)],
    },
    push: {
      type: Boolean,
      default: false,
    },
    email: {
      type: Boolean,
      default: false,
    },
    sms: {
      type: Boolean,
      default: false,
    },
  });
