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

export const recursivelySignUrls = async <ObjectType = any>(
  obj: ObjectType,
  secondsUntilExpiry: number = 300,
): Promise<ObjectType> => {
  if (Array.isArray(obj)) {
    return (await Promise.all(
      obj.map(async (item) => {
        if (typeof item === 'string' && isS3Url(item)) {
          return await preSignFile(item, secondsUntilExpiry);
        } else {
          return await recursivelySignUrls(item, secondsUntilExpiry);
        }
      }),
    )) as unknown as ObjectType;
  } else if (typeof obj === 'object' && obj !== null) {
    const isMongooseDoc = obj.constructor?.name === 'model';
    const clonedObj: TODO = isMongooseDoc
      ? (obj as unknown as { toObject: () => ObjectType }).toObject()
      : { ...obj };
    for (const key in clonedObj) {
      if (typeof clonedObj[key] === 'string' && isS3Url(clonedObj[key])) {
        clonedObj[key] = await preSignFile(clonedObj[key], secondsUntilExpiry);
      } else if (Array.isArray(clonedObj[key])) {
        clonedObj[key] = await recursivelySignUrls(
          clonedObj[key],
          secondsUntilExpiry,
        );
      } else if (
        typeof clonedObj[key] === 'object' &&
        clonedObj[key] !== null
      ) {
        clonedObj[key] = await recursivelySignUrls(
          clonedObj[key],
          secondsUntilExpiry,
        );
      }
    }
    return clonedObj;
  } else {
    return obj;
  }
};
