import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { config } = require('dotenv');
const process = require('process');
import { getBaseSettings } from '@the-libs/base-backend';

config();

export interface EmailSettings {
  sendgridApiKey: string;
  sendgridSender: string;
}

export const getEmailSettings = <
  CB extends { [key: string]: string },
>(): EmailSettings => ({
  sendgridApiKey: process.env['SENDGRID_API_KEY'] ?? '',
  sendgridSender:
    process.env['SENDGRID_SENDER'] ??
    'service@' + getBaseSettings<CB>().clientDomains['single'],
});
