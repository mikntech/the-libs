import { getModel } from '@base-backend';
import { NotificationRule } from '@notifications-shared';
import { Rules } from '@offisito-shared';

export const notificationRule = () =>
  getModel<NotificationRule>('notificationRule', {
    userId: { type: String },
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
