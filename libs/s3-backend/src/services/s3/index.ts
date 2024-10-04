import { s3Settings } from '../../config';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} = require('@aws-sdk/client-s3');

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

export const s3Client = new S3Client({
  region: s3Settings.aws.region,
  credentials: {
    accessKeyId: s3Settings.aws.keyID,
    secretAccessKey: s3Settings.aws.secretKey,
  },
});

export const uploadFile = async (
  key: string,
  buffer: Buffer,
  mimetype: string,
) =>
  s3Client.send(
    new PutObjectCommand({
      Bucket: s3Settings.s3BucketName,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    }),
  );

export const preSignFile = async (
  filePath: string,
  secondsUntilExpiry: number = 300,
): Promise<string> => {
  if (!filePath) throw new Error('fie not found at path "' + filePath + '"');
  return await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: s3Settings.s3BucketName,
      Key: filePath,
    }),
    {
      expiresIn: secondsUntilExpiry,
    },
  );
};

const isS3Url = (url: string) => url.startsWith('s3://');

export const recursivelySignUrls = async <ObjectType = any>(
  obj: ObjectType,
  secondsUntilExpiry: number = 300,
) => {
  if (Array.isArray(obj)) {
    obj.forEach((item) => recursivelySignUrls(item));
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && isS3Url(obj[key])) {
        obj[key] = (await preSignFile(
          obj[key],
          secondsUntilExpiry,
        )) as (ObjectType & object)[Extract<keyof ObjectType, string>];
      } else if (typeof obj[key] === 'object') {
        recursivelySignUrls(obj[key]);
      }
    }
  }
};
