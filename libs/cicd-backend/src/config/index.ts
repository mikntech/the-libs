import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { config } = require('dotenv');
const process = require('process');

config();

export interface AWSConfig {
  keyID: string;
  secretKey: string;
  region: string;
}

export interface CICDSettings {
  aws: AWSConfig;
}

export const getAws = () => ({
  keyID: process.env['AWS_KEY_ID'] ?? '',
  secretKey: process.env['AWS_SECRET_KEY'] ?? '',
  region: process.env['AWS_REGION'] ?? '',
});

export const cicdSettings: CICDSettings = {
  aws: getAws(),
};
