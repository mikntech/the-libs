import { authClient, derivativesApi } from '../../services';
import { getToken } from './auth';
import { downloadFile, s3Settings } from '@the-libs/s3-backend';
import { encodeUrn } from './encodeUrn';
import { uploadToForge } from './upload';

const checkTranslationStatus = async (encodedUrn: string) => {
  try {
    const manifest = await derivativesApi.getManifest(
      encodedUrn,
      {},
      authClient,
      await getToken(),
    );

    if (manifest.body.status === 'complete') {
      return true;
    } else if (manifest.body.status === 'inprogress') {
      return false;
    } else {
      console.error('Translation failed:', manifest.body);
      return false;
    }
  } catch (e: any) {
    console.error('Error checking translation status:', e.message || e);
    return false;
  }
};

const streamToBuffer = async (stream: any): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};
export const translate = async (s3Key: string) => {
  try {
    const fileBuffer = await streamToBuffer((await downloadFile(s3Key)).Body);
    if (fileBuffer.length === 0) {
      throw new Error('Downloaded file is empty');
    }
    const forgeBucketKey = s3Settings.s3BucketName;
    const fileName = s3Key;
    if (!fileName) {
      throw new Error('Invalid S3 key, unable to extract file name.');
    }
    await uploadToForge(forgeBucketKey, fileName, fileBuffer);
    const encodedUrn = encodeUrn(forgeBucketKey, fileName);
    await derivativesApi.translate(
      {
        input: { urn: encodedUrn },
        output: { formats: [{ type: 'svf', views: ['2d', '3d'] }] },
      },
      {},
      authClient,
      await getToken(),
    );
    let isComplete = false;
    while (!isComplete) {
      isComplete = await checkTranslationStatus(encodedUrn);
      if (!isComplete) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    return { statusCode: 201, body: encodedUrn };
  } catch (e: any) {
    console.error('Error during translation workflow:', e.message || e, {
      responseData: e.response?.data,
      responseStatus: e.response?.status,
    });
    return { statusCode: 500, body: 'Translation failed' };
  }
};
