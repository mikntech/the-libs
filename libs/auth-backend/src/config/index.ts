import { config } from 'dotenv';
import * as process from 'node:process';

config();

export interface AuthSettings {
  jwtSecret: string;
}

export const authSettings: AuthSettings = {
  jwtSecret: process.env['JWT_SECRET'] ?? '',
};
