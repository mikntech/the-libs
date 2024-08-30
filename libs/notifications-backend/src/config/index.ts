import { config } from 'dotenv';
const process = require('process');

config();

export interface NotificationsSettings {
  pushSubject: string;
  pushPublicKey: string;
  pushPrivateKey: string;
}

export const notificationsSettings: NotificationsSettings = {
  pushSubject: process.env['PUSH_SUBJECT'],
  pushPublicKey: process.env['PUSH_PUBLIC_KEY'],
  pushPrivateKey: process.env['PUSH_PRIVATE_KEY'],
};
