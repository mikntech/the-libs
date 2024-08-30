import { getModel } from '@base-backend';
import { Notification, NotificationRule } from '@notifications-shared';
import { SomeEnum } from '@base-shared';

export const notificationRule = <Rules>(RulesValue: SomeEnum<Rules>) =>
  getModel<NotificationRule<Rules>>('notificationRule', {
    userId: { type: String },
    key: {
      type: String,
      enum: [...Object.keys(RulesValue)],
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
