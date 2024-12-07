import { BasePayment } from '../abstract';

export interface HapoalimTransfer extends BasePayment {
  sender: string;
}
