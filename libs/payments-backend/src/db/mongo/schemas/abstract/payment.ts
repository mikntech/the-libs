import { PaymentMethod, Currency, PaymentStatus } from '../../../../types';

export const basePayment = {
  amount: { type: Number, required: true },
  currency: { type: String, enum: Object.values(Currency), required: true },
  method: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  },
  manualStatus: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.UNKNOWN,
    required: true,
  },
  automaticStatus: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.UNKNOWN,
    required: true,
  },
  timestamp: { type: Number, required: true },
  userId: String,
  transactionId: String,
};
