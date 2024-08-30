export * from './stripe';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { Types } = require('mongoose');
import type { Document as MDocument } from 'mongoose';

export interface BaseEvent extends MDocument {
  _id: Types.ObjectId;
  idOnSource: string;
  tsOnSource: number;
  wasHandled: boolean;
  wasProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
