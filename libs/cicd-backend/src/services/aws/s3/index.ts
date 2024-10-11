import { createRequire } from 'module';
import { createClient } from '../utils';
const require = createRequire(import.meta.url);

const {
  S3Client,
  CreateBucketCommand,
  PutBucketVersioningCommand,
  PutBucketPolicyCommand,
} = require('@aws-sdk/client-s3');

export const createS3Bucket = async (
  bucketName: string,
  enableVersioning = false,
  publicAccess = false,
) => {
  try {
    const client = createClient<typeof S3Client>(S3Client);

    const createBucketCommand = new CreateBucketCommand({
      Bucket: bucketName,
    });
    const createBucketResponse = await client.send(createBucketCommand);
    console.log('S3 Bucket Created Successfully:', createBucketResponse);

    if (enableVersioning) {
      const versioningCommand = new PutBucketVersioningCommand({
        Bucket: bucketName,
        VersioningConfiguration: {
          Status: 'Enabled',
        },
      });
      await client.send(versioningCommand);
      console.log(`Versioning enabled for bucket: ${bucketName}`);
    }

    if (publicAccess) {
      const publicPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucketName}/*`,
          },
        ],
      };
      const policyCommand = new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(publicPolicy),
      });
      await client.send(policyCommand);
      console.log(`Public access policy set for bucket: ${bucketName}`);
    }

    return createBucketResponse;
  } catch (error) {
    console.error('Error creating S3 bucket:', error);
  }
};
