import { getModel } from '@base-backend';
import { PushDevice } from '@notifications-shared';

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
