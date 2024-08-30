export * from './stripe';

import x from 'mongoose';

export interface BaseEvent extends x.Document {
  _id: x.Types.ObjectId;
  idOnSource: string;
  tsOnSource: number;
  wasHandled: boolean;
  wasProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
