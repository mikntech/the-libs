import { s3Settings } from '../../config';
import { createRequire } from 'module';
import { TODO } from '@the-libs/base-shared';
const require = createRequire(import.meta.url);

const {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} = require('@aws-sdk/client-s3');

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { Upload } = require('@aws-sdk/lib-storage');

export const createS3Client = () =>
  new S3Client({
    region: s3Settings.aws.region,
    credentials: {
      accessKeyId: s3Settings.aws.keyID,
      secretAccessKey: s3Settings.aws.secretKey,
    },
  });

export const streamFile = async (
  key: string,
  buffer: TODO,
  mimetype: string,
) => {
  try {
    const upload = new Upload({
      client: createS3Client(),
      params: {
        Bucket: s3Settings.s3BucketName!,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      },
    });

    await upload.done();
  } catch (err) {
    throw err;
  }
};

export const uploadFile = async (key: string, buffer: TODO, mimetype: string) =>
  createS3Client().send(
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
  filePath = filePath.split('s3://')[1] ?? filePath.split('s3://')[0];
  if (!filePath) throw new Error('file not found at path "' + filePath + '"');
  return await getSignedUrl(
    createS3Client(),
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

export const recursivelySignUrls = async <T = any>(
  obj: T,
  secondsUntilExpiry: number = 300,
): Promise<T> => {
  const process = async (input: any): Promise<any> => {
    if (typeof input === 'string') {
      if (isS3Url(input)) {
        // Replace S3 URL with signed URL
        return await preSignFile(input, secondsUntilExpiry);
      }
      return input;
    }

    if (Array.isArray(input)) {
      let changed = false;
      const result = await Promise.all(
        input.map(async (item) => {
          const newItem = await process(item);
          if (newItem !== item) {
            changed = true;
          }
          return newItem;
        }),
      );
      return changed ? result : input;
    }

    if (input && typeof input === 'object') {
      let changed = false;
      const result: TODO = {};
      for (const [key, value] of Object.entries(input)) {
        const newValue = await process(value);
        if (newValue !== value) {
          changed = true;
        }
        result[key] = newValue;
      }
      if (changed) {
        // Clone the object while preserving its prototype
        const clonedObj = Object.create(Object.getPrototypeOf(input));
        Object.assign(clonedObj, input, result);
        return clonedObj;
      }
      return input;
    }

    return input;
  };

  return await process(obj);
};

export const downloadFile = async (key: string) =>
  await createS3Client().send(
    new GetObjectCommand({
      Bucket: s3Settings.s3BucketName,
      Key: key,
    }),
  );
