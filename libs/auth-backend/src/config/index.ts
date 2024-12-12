import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { config } = require('dotenv');
const process = require('process');

config();

export interface AuthSettings {
  jwtSecret: string;
  googleClientId: string;
  googleSecretId: string;
}

export const authSettings: AuthSettings = {
  jwtSecret: process.env['JWT_SECRET'] ?? '',
  googleClientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
  googleSecretId: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
};
