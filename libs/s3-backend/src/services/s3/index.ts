import { s3Settings } from '../../config';
import { createRequire } from 'module';
import { Readable } from 'stream';
import { S3Client as S3, GetObjectCommandOutput } from '@aws-sdk/client-s3';
const require = createRequire(import.meta.url);
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { Upload } = require('@aws-sdk/lib-storage');
const { NodeHttpHandler } = require('@smithy/node-http-handler');

export const createS3Client = (): S3 =>
  new S3Client({
    region: s3Settings.aws.region,
    credentials: {
      accessKeyId: s3Settings.aws.keyID,
      secretAccessKey: s3Settings.aws.secretKey,
    },
    requestHandler: new NodeHttpHandler({
      connectionTimeout: 600000, // 10 minutes
      requestTimeout: 600000, // 10 minutes
    }),
    maxAttempts: 5, // Retry up to 5 times
    retryMode: 'adaptive',
  });

const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

export const streamFile = async (
  key: string,
  buffer: Buffer | Readable,
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

export const uploadFile = async (
  key: string,
  buffer: Buffer | Readable,
  mimetype: string,
) =>
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
  secondsUntilExpiry = 300,
): Promise<string> => {
  filePath = filePath.replace(/^s3:\/\//, '');
  if (!filePath) throw new Error(`Invalid S3 file path: "${filePath}"`);
  return getSignedUrl(
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
  secondsUntilExpiry = 300,
): Promise<T> => {
  const process = async (input: any): Promise<any> => {
    if (typeof input === 'string' && isS3Url(input)) {
      return preSignFile(input, secondsUntilExpiry);
    }

    if (Array.isArray(input)) {
      return Promise.all(input.map(process));
    }

    if (input && typeof input === 'object') {
      if (input instanceof Date) return input;
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(input)) {
        result[key] = await process(value);
      }
      return result;
    }

    return input;
  };

  return process(obj);
};

export const downloadFile = async (
  key: string,
): Promise<GetObjectCommandOutput> => {
  return createS3Client().send(
    new GetObjectCommand({
      Bucket: s3Settings.s3BucketName,
      Key: key,
    }),
  );
};

export const downloadAndExtractFile = async (
  key: string,
): Promise<{
  key: string;
  fileBuffer: Buffer;
  mimetype: string | undefined;
}> => {
  const response = await downloadFile(key);

  if (!response.Body) {
    throw new Error(`No file data returned from S3 for key: ${key}`);
  }

  let fileBuffer: Buffer;

  // Fix for ReadableStream check (Node.js)
  if (response.Body instanceof Readable) {
    fileBuffer = await streamToBuffer(response.Body);
  }
  // Fix for Blob check (Browser)
  else if (response.Body instanceof Blob) {
    fileBuffer = Buffer.from(await response.Body.arrayBuffer());
  }
  // Fix for ReadableStream check (Browser without Blob support)
  else if (typeof response.Body.getReader === 'function') {
    const reader = response.Body.getReader();
    const chunks: Uint8Array[] = [];
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (value) chunks.push(value);
      done = readerDone;
    }
    fileBuffer = Buffer.concat(chunks);
  } else {
    throw new Error(`Unsupported response body type received.`);
  }

  return { key, fileBuffer, mimetype: response.ContentType };
};
