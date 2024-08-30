import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import type { Document as MDocument, Types } from 'mongoose';
export interface ErrorLog extends MDocument {
  _id: Types.ObjectId;
  stringifiedError: string;
  createdAt: Date;
  updatedAt: Date;
}
