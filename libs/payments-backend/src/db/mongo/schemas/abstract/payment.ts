import {
  PaymentMethod,
  Currency,
  PaymentStatus,
} from '@the-libs/payments-shared';

export const basePayment = {
  amount: { type: Number, required: true },
  currency: { type: String, enum: Object.keys(Currency), required: true },
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
