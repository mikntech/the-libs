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

const { NodeHttpHandler } = require('@smithy/node-http-handler');
import { Readable } from 'stream'; // Needed to work with streams in Node.js

export const createS3Client = () =>
  new S3Client({
    region: s3Settings.aws.region,
    credentials: {
      accessKeyId: s3Settings.aws.keyID,
      secretAccessKey: s3Settings.aws.secretKey,
    },
    requestHandler: new NodeHttpHandler({
      connectionTimeout: 600000, // 10 minutes
      socketTimeout: 600000, // 10 minutes
    }),
    maxAttempts: 5, // Retry up to 5 times
    retryMode: 'adaptive',
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
      queueSize: 3, // Parallel uploads
      partSize: 5 * 1024 * 1024, // 5 MB parts
    });

    await upload.done();
    console.log(`File uploaded successfully to S3: ${key}`);
  } catch (err) {
    console.error(`Failed to upload file to S3: ${key}`, err);
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

export const downloadAndExtractFile = async (
  key: string,
): Promise<{
  key: string;
  fileBuffer: Buffer;
  mimetype: string | undefined;
}> => {
  const response = await downloadFile(key);

  const body = response.Body;
  if (!body) {
    throw new Error('No file data returned from S3.');
  }

  const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  };

  const fileBuffer: Buffer =
    body instanceof Readable
      ? await streamToBuffer(body)
      : Buffer.from(await body.arrayBuffer());

  const mimetype = response.ContentType;

  return { key, fileBuffer, mimetype };
};
