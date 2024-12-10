import type { Types, Document as MDocument } from 'mongoose';

export interface BaseEvent extends MDocument {
  _id: Types.ObjectId;
  idOnSource: string;
  tsOnSource: number;
  wasHandled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
