import { Payment } from '../abstract';

export interface HapoalimTransfer extends Payment {
  sender: string;
}
