import { Types } from 'mongoose';
import { getModel } from '@base-backend';
import { SomeEnum } from '@base-shared';
import { Notification } from '@notifications-shared';

export const notification = <Rules>(RulesValue: SomeEnum<Rules>) =>
  getModel<Notification<Rules>>('notification', {
    rule: { type: Types.ObjectId, ref: 'notificationRule', required: true },
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
