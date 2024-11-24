import { getModel } from '@the-libs/mongo-backend';
import {
  PaymentMethod,
  Payment,
  Currency,
  PaymentStatus,
} from '../../../../types/db/mongo/schemas/payment';

export const payment = () =>
  getModel<Payment>('payment', {
    amount: { type: Number, required: true },
    currency: { type: String, enum: Object.values(Currency), required: true },
    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.UNKNOWN,
      required: true,
    },
    timestamp: { type: Number, required: true },
    userId: String,
    transactionId: String,
  });
