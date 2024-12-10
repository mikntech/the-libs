import { getModel } from '@the-libs/mongo-backend';
import { HapoalimTransfer } from '@the-libs/payments-shared';
import { basePayment } from '../abstract';

export const hapoalimTransfer = () =>
  getModel<HapoalimTransfer>('hapoalimTransfer', {
    ...basePayment,
    sender: { type: String, required: true },
  });
