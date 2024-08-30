export * from './stripe';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import type { Types } from 'mongoose';

export interface BaseEvent extends x.Document {
  _id: Types.ObjectId;
  idOnSource: string;
  tsOnSource: number;
  wasHandled: boolean;
  wasProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
