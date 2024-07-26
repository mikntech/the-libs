import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { s3Settings } from '../../config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
  await s3Client.send(
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
): Promise<string> =>
  getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: s3Settings.s3BucketName,
      Key: filePath,
    }),
    {
      expiresIn: secondsUntilExpiry,
    },
  );
