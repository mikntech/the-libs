import { createRequire } from 'module';
import { createClient } from '../utils';
const require = createRequire(import.meta.url);
const {
  ECRClient,
  CreateRepositoryCommand,
  ImageTagMutability,
} = require('@aws-sdk/client-ecr');
const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');

interface Options {
  region: string;
  imageTagMutability: keyof typeof ImageTagMutability;
  scanOnPush: boolean;
}

export const createECRRepository = async (
  repositoryName: string,
  options: Partial<Options>,
) => {
  
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
    
    return response;
  } catch (error) {
    
  }
};

export const createMultipleECRRepositories = async (
  projectName: string,
  appNames: string[],
  region?: string,
) =>
  Promise.all(
    ['base', ...appNames].map(async (appName) =>
      createECRRepository(projectName + '/' + appName, { region }),
    ),
  );

export const getEcrUri = async (log: boolean = true, region?: string) => {
  const stsClient = await createClient<typeof STSClient>(STSClient, region);

  try {
    const identityCommand = new GetCallerIdentityCommand({});
    const identityResponse = await stsClient.send(identityCommand);
    const accountId = identityResponse.Account;

    const ecrBaseUri = `${accountId}.dkr.ecr.${await stsClient.config.region()}.amazonaws.com`;

    log && 
    return ecrBaseUri;
  } catch (error) {
    
    return null;
  }
};

export const getAccountId = async (region?: string) => {
  const client = createClient<typeof STSClient>(STSClient, region);
  try {
    const command = new GetCallerIdentityCommand({});
    const response = await client.send(command);
    return response.Account;
  } catch (error) {
    
    return null;
  }
};
