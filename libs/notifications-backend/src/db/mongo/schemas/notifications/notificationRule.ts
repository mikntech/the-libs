import { getModel } from '@the-libs/base-backend';
import { Notification, NotificationRule } from '@the-libs/notifications-shared';
import { SomeEnum } from '@the-libs/base-shared';

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
