import { config } from 'dotenv';
import * as process from 'node:process';
import { getBaseSettings } from '@base-backend';

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
