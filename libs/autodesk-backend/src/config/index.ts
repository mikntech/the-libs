import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { config } = require('dotenv');
const process = require('process');

config();

export interface AutodeskSettings {
  autodeskClientId: string;
  autodeskClientSecret: string;
}

export const autodeskSettings: AutodeskSettings = {
  autodeskClientId: process.env['AUTODESK_CLIENT_ID'] ?? '',
  autodeskClientSecret: process.env['AUTODESK_CLIENT_SECRET'] ?? '',
};
