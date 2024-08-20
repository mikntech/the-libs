export * from './stripe';

import { Document, Types } from 'mongoose';

export interface BaseEvent extends Document {
  _id: Types.ObjectId;
  idOnSource: string;
  tsOnSource: number;
  wasHandled: boolean;
  wasProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
