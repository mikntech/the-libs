import { createRequire } from 'module';
import { AWSConfig, getAws } from '@the-libs/cicd-backend';
const require = createRequire(import.meta.url);

const { config } = require('dotenv');
const process = require('process');

config();

export interface S3Settings {
  aws: AWSConfig;
  s3BucketName: string;
}

export const s3Settings: S3Settings = {
  aws: getAws(),
  s3BucketName: process.env['S3_BUCKET_NAME'] ?? '',
};
