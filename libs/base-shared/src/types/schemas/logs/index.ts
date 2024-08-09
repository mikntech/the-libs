import { Document as MDocument, Types } from 'mongoose';

export interface ErrorLog extends MDocument<Types.ObjectId> {
  stringifiedError: string;
  createdAt: Date;
  updatedAt: Date;
}
