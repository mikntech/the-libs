import { config } from 'dotenv';
import * as process from 'node:process';

config();

export interface PaymentsSettings {
  syncIntervalInSeconds: number;
  stripeApiKey: string;
  stripeApiVersion: string;
}

export const paymentsSettings: PaymentsSettings = {
  syncIntervalInSeconds: parseInt(
    process.env['SYNC_INTERVAL_IN_SECONDS'] || '',
  ),
  stripeApiKey: process.env['STRIPE_API_KEY'] || '',
  stripeApiVersion: process.env['STRIPE_API_VERSION'] || '',
};

if (paymentsSettings.syncIntervalInSeconds < 5)
  throw new Error(
    'SYNC_INTERVAL_IN_SECONDS must be at least 5, to avoid server abuse',
  );
