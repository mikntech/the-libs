import { Document as MDocument, Types } from 'mongoose';

export * from './auth';
export * from './business';
export * from './plans';
export * from './projects';
export * from './transactions';

export interface Address extends MDocument {
  _id: Types.ObjectId;
  street?: string;
  city?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}
