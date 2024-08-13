import { TODO } from '@base-shared';
import { Types, Document as MDocument } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Transaction extends MDocument {
  _id: Types.ObjectId;
  customer_id: Types.ObjectId;
  apartment_id: Types.ObjectId;
  num_of_additional_parking: number;
  total_price: number;
  date: Date;
  payment_method: TODO;
  payment_status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}
