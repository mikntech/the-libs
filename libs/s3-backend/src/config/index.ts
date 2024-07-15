import { config } from 'dotenv';
import * as process from 'node:process';

config();

interface AWSConfig {
  keyID: string;
  secretKey: string;
  region: string;
}

export interface S3Settings {
  aws: AWSConfig;
  s3BucketName: string;
}

export const s3Settings: S3Settings = {
  aws: {
    keyID: process.env['AWS_KEY_ID'] ?? '',
    secretKey: process.env['AWS_SECRET_KEY'] ?? '',
    region: process.env['AWS_REGION'] ?? '',
  },
  s3BucketName: process.env['S3_BUCKET_NAME'] ?? '',
};
