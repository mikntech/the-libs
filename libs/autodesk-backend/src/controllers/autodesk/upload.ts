import { authClient, objectsApi } from '../../services';
import { getToken } from './auth';

const checkFileAccessibility = async (
  forgeBucketKey: string,
  fileName: string,
  retries: number = 3,
  delay: number = 2000,
): Promise<boolean> => {
  let isFileAccessible = false;
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await objectsApi.getObjects(
      forgeBucketKey,
      { beginsWith: fileName },
      authClient,
      await getToken(),
    );
    if (response.body.items.length > 0) {
      isFileAccessible = true;
      break;
    } else {
      console.log(`File not found, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return isFileAccessible;
};

export const uploadToForge = async (
  bucketKey: string,
  fileName: string,
  fileBuffer: Buffer,
): Promise<string> => {
  try {
    if (!Buffer.isBuffer(fileBuffer)) {
      throw new Error('Invalid fileBuffer: Expected a Buffer object');
    }
    const contentLength = fileBuffer.length;
    const token = await getToken();

    await objectsApi.uploadObject(
      bucketKey,
      fileName,
      contentLength,
      fileBuffer,
      {},
      authClient,
      token,
    );
    console.log('File uploaded successfully to Forge:', fileName);

    const isFileAccessible = await checkFileAccessibility(bucketKey, fileName);
    if (!isFileAccessible) {
      throw new Error('File not accessible after upload.');
    }

    return `urn:adsk.objects:os.object:${bucketKey}/${fileName}`;
  } catch (e: any) {
    console.error('Error uploading to Forge:', e.message || e, {
      responseData: e.response?.data,
      responseStatus: e.response?.status,
    });
    throw e;
  }
};
