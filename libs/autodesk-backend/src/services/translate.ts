import { authClient, derivativesApi } from './index';
import { downloadFile, s3Settings } from '@the-libs/s3-backend';
import { uploadToForge } from './upload';
import { encodeUrn, getToken } from '../controllers/autodesk';

const waitForTranslationStatus = async (
  encodedUrn: string,
): Promise<boolean> => {
  try {
    while (true) {
      const manifest = await derivativesApi.getManifest(
        encodedUrn,
        {},
        authClient,
        await getToken(),
      );

      const status = manifest.body.status;

      if (status === 'complete') {
        console.log('Translation completed successfully.');
        return true;
      } else if (status === 'pending') {
        console.log(
          'Translation is still pending. Checking again in 5 seconds...',
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } else {
        console.error('Translation not completed. Status:', status);
        return false;
      }
    }
  } catch (error: any) {
    console.error('Error checking translation status:', error.message || error);
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
    await waitForTranslationStatus(encodedUrn);
    return { statusCode: 201, body: encodedUrn };
  } catch (e: any) {
    console.error('Error during translation workflow:', e.message || e, {
      responseData: e.response?.data,
      responseStatus: e.response?.status,
    });
    return { statusCode: 500, body: 'Translation failed' };
  }
};
