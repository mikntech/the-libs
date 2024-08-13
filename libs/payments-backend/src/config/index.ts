import { config } from 'dotenv';
import * as process from 'node:process';

config();

export interface PaymentsSettings {
  stripeApiKey: string;
}

export const paymentsSettings: PaymentsSettings = {
  stripeApiKey: process.env['STRIPE_API_KEY'] || '',
};
