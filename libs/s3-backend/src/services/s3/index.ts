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
): Promise<ObjectType | null | {}> => {
  const ret: any = structuredClone(obj);
  if (Array.isArray(ret)) {
    await Promise.all(
      ret.map((item) => recursivelySignUrls(item, secondsUntilExpiry)),
    );
  } else if (typeof ret === 'object' && ret !== null) {
    for (const key in ret) {
      if (typeof ret[key] === 'string') {
        if (isS3Url(ret[key]))
          ret[key] = await preSignFile(ret[key], secondsUntilExpiry);
        return ret;
      } else if (typeof ret[key] === 'object') {
        return recursivelySignUrls(ret[key], secondsUntilExpiry);
      }
    }
  } else return null;
  return ret;
};
