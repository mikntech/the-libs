import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { config } = require('dotenv');
const process = require('process');

config();

export interface TwilioSettings {
  clientId: string;
  clientSecret: string;
  sms_service?: string;
  number?: string;
}

export const twilioSettings: TwilioSettings = {
  clientId: process.env['TWILIO_ID'] ?? '',
  clientSecret: process.env['TWILIO_SECRET'] ?? '',
  sms_service: process.env['TWILIO_SERVICE'],
  number: process.env['TWILIO_NUMBER'],
};
