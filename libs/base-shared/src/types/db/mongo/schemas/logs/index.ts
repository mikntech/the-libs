import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { Document as MDocument, Types } = require('mongoose');
export interface ErrorLog extends MDocument {
  _id: Types.ObjectId;
  stringifiedError: string;
  createdAt: Date;
  updatedAt: Date;
}
