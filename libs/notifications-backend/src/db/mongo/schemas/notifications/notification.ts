import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import type { Types } from 'mongoose';
import { getModel } from '@the-libs/base-backend';
import { SomeEnum } from '@the-libs/base-shared';
import { Notification } from '@the-libs/notifications-shared';

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
