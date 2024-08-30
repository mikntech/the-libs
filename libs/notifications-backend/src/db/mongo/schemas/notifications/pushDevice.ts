import { getModel } from '@the-libs/base-backend';
import { PushDevice } from '@the-libs/notifications-shared';

export const pushDevice = () =>
  getModel<PushDevice>('pushDevice', {
    userId: { type: String },
    name: { type: String, unique: true },
    subscription: {
      endpoint: { type: String },
      keys: {
        p256dh: { type: String },
        auth: { type: String },
      },
    },
  });
