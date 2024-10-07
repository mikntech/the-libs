import { s3Settings } from '../../config';
import { createRequire } from 'module';
import { TODO } from '@the-libs/base-shared';
const require = createRequire(import.meta.url);
const { Types } = require('mongoose');

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

export const uploadFile = async (key: string, buffer: TODO, mimetype: string) =>
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
  filePath = filePath.split('s3://')[1] ?? filePath.split('s3://')[0];
  if (!filePath) throw new Error('file not found at path "' + filePath + '"');
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
export const recursivelySignUrls1 = async <ObjectType = any>(
  obj: ObjectType,
  secondsUntilExpiry: number = 300,
): Promise<ObjectType> => {
  // Helper function to check if an object or array contains any S3 URLs
  const containsS3Url = (input: any): boolean => {
    if (typeof input === 'string' && isS3Url(input)) return true;
    if (Array.isArray(input)) {
      return input.some((item) => containsS3Url(item));
    }
    if (typeof input === 'object' && input !== null) {
      return Object.values(input).some((value) => containsS3Url(value));
    }
    return false;
  };

  // If the input is an array, process each item
  if (Array.isArray(obj)) {
    return (await Promise.all(
      obj.map(async (item) =>
        typeof item === 'string' && isS3Url(item)
          ? await preSignFile(item, secondsUntilExpiry)
          : await recursivelySignUrls1(item, secondsUntilExpiry),
      ),
    )) as ObjectType;
  }

  // If it's an object and contains an S3 URL, clone and process it
  if (typeof obj === 'object' && obj !== null && containsS3Url(obj)) {
    const isMongooseDoc = obj.constructor?.name === 'model';
    const clonedObj: any = isMongooseDoc
      ? (obj as unknown as { toObject: () => ObjectType }).toObject()
      : { ...obj };

    for (const key in clonedObj) {
      const value = clonedObj[key];

      // Skip ObjectId instances to prevent alteration
      if (value instanceof Types.ObjectId) {
        clonedObj[key] = value;
      } else if (typeof value === 'string' && isS3Url(value)) {
        clonedObj[key] = await preSignFile(value, secondsUntilExpiry);
      } else if (
        Array.isArray(value) ||
        (typeof value === 'object' && value !== null)
      ) {
        clonedObj[key] = await recursivelySignUrls1(value, secondsUntilExpiry);
      }
    }
    return clonedObj as ObjectType;
  }

  // If no S3 URLs found, return the object as-is
  return obj;
};

export const recursivelySignUrls2 = async <T = any>(
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
