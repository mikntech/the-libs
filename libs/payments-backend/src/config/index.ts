import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { config } = require('dotenv');
const process = require('process');

config();

export interface PaymentsSettings {
  syncIntervalInSeconds: number;
  stripeApiKey: string;
  stripeApiVersion: string;
  ppbaseURL: string;
  ppclientId: string;
  ppclientSecret: string;
}

export const paymentsSettings: PaymentsSettings = {
  syncIntervalInSeconds: parseInt(
    process.env['SYNC_INTERVAL_IN_SECONDS'] || '',
  ),
  stripeApiKey: process.env['STRIPE_API_KEY'] || '',
  stripeApiVersion: process.env['STRIPE_API_VERSION'] || '',
  ppbaseURL: process.env['PAYPAL_API'] ?? '',
  ppclientId: process.env['PAYPAL_CLIENT_ID'] ?? '',
  ppclientSecret: process.env['PAYPAL_CLIENT_SECRET'] ?? '',
};

if (paymentsSettings.syncIntervalInSeconds < 5)
  throw new Error(
    'SYNC_INTERVAL_IN_SECONDS must be at least 5, to avoid server abuse',
  );
