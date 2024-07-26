import { config } from 'dotenv';
import * as process from 'node:process';

config();

export interface AutodeskSettings {
  AUTODESK_CLIENT_ID: string;
  AUTODESK_CLIENT_SECRET: string;
}

export const autodeskSettings: AutodeskSettings = {
  AUTODESK_CLIENT_ID: process.env['AUTODESK_CLIENT_ID'] ?? '',
  AUTODESK_CLIENT_SECRET: process.env['AUTODESK_CLIENT_SECRET'] ?? '',
};
