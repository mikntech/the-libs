import { Document, Types } from 'mongoose';

export interface StripeEvent extends Document {
  _id: Types.ObjectId;
  stripeEvent: string;
  createdAt: Date;
  updatedAt: Date;
}
