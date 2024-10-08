import { createRequire } from 'module';
import { createClient } from '../utils';
const require = createRequire(import.meta.url);
const {
  Route53Client,
  CreateHostedZoneCommand,
} = require('@aws-sdk/client-route-53');

export const createHostedZone = async (domainName: string, region?: string) => {
  const client = createClient<typeof Route53Client>(Route53Client, region);
  const params = {
    Name: domainName,
    CallerReference: `cli-script-${Date.now()}`,
  };
  try {
    const command = new CreateHostedZoneCommand(params);
    const response = await client.send(command);
    return {
      response,
      tellUserToConfigure: response.DelegationSet.NameServers,
    };
  } catch (error) {
    console.error('Error creating hosted zone:', error);
    return null;
  }
};
