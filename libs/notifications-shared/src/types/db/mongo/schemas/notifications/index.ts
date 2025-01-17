import type { Types } from 'mongoose';
import { User } from '@the-libs/auth-shared';
import { DBDoc } from '@the-libs/mongo-backend';

export interface PushDevice extends DBDoc {
  userId: string;
  name: string;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}

export interface NotificationRule<Rules> extends DBDoc {
  userId: string;
  key: Rules;
  push?: boolean;
  email?: boolean;
  sms?: boolean;
}

export interface Notification<Rules> extends DBDoc {
  _id: Types.ObjectId;
  key: Rules;
  recipients: { user: User; readTs: number }[];
  createdAt: Date;
  updateAt: Date;
}
