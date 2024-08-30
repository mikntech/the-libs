import { Document as MDocument, Types } from 'mongoose';
import { Rules } from '@offisito-shared';
import { User } from '@auth-backend';

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

export interface NotificationRule extends MDocument {
  userId: string;
  key: Rules;
  push?: boolean;
  email?: boolean;
  sms?: boolean;
}

export interface Notification extends MDocument {
  _id: Types.ObjectId;
  key: Rules;
  recipients: { user: User; readTs: number }[];
  createdAt: Date;
  updateAt: Date;
}
