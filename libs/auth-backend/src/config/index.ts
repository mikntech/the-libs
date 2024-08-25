import { config } from 'dotenv';
const process = require('process');

config();

export interface AuthSettings {
  jwtSecret: string;
}

export const authSettings: AuthSettings = {
  jwtSecret: process.env['JWT_SECRET'] ?? '',
};
