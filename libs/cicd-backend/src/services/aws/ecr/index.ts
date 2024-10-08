import { createRequire } from 'module';
import { createClient } from '../utils';
const require = createRequire(import.meta.url);
const {
  ECRClient,
  CreateRepositoryCommand,
  ImageTagMutability,
} = require('@aws-sdk/client-ecr');

interface Options {
  region: string;
  imageTagMutability: keyof typeof ImageTagMutability;
  scanOnPush: boolean;
}

export const createECRRepository = async (
  repositoryName: string,
  options: Partial<Options>,
) => {
  console.log('repositoryName: ', repositoryName);
  let { imageTagMutability, scanOnPush, region } = options;
  if (imageTagMutability === undefined)
    imageTagMutability = ImageTagMutability.IMMUTABLE;
  if (scanOnPush === undefined) scanOnPush = false;
  const client = createClient<typeof ECRClient>(ECRClient, region);
  const params = {
    repositoryName: `mik${repositoryName}`,
    imageScanningConfiguration: {
      scanOnPush,
    },
    imageTagMutability,
  };
  try {
    const command = new CreateRepositoryCommand(params);
    const response = await client.send(command);
    console.log('ECR Repository Created Successfully:', response);
    return response;
  } catch (error) {
    console.error('Error creating ECR repository:', error);
  }
};

export const createMultipleECRRepositories = (
  projectName: string,
  appNames: string[],
  region?: string,
) =>
  appNames.forEach((appName) =>
    createECRRepository(projectName + '/' + appName, { region }),
  );
