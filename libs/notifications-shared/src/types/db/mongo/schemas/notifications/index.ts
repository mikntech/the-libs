import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import type { Document as MDocument, Types } from 'mongoose';
import { User } from '@the-libs/auth-backend';

export interface PushDevice extends MDocument {
  _id: Types.ObjectId;
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

export interface NotificationRule<Rules> extends MDocument {
  userId: string;
  key: Rules;
  push?: boolean;
  email?: boolean;
  sms?: boolean;
}

export interface Notification<Rules> extends MDocument {
  _id: Types.ObjectId;
  key: Rules;
  recipients: { user: User; readTs: number }[];
  createdAt: Date;
  updateAt: Date;
}
