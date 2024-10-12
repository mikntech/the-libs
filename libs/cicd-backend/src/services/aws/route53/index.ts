import { createRequire } from 'module';
import { createClient } from '../utils';
const require = createRequire(import.meta.url);
const {
  Route53Client,
  CreateHostedZoneCommand,
  ChangeResourceRecordSetsCommand,
  ListHostedZonesByNameCommand,
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
    const id = response.HostedZone.Id.split('/');
    return {
      response,
      keepID: id[id.length - 1],
      tellUserToConfigure: response.DelegationSet.NameServers,
    };
  } catch (error) {
    console.error('Error creating hosted zone:', error);
    return null;
  }
};

export const createDNSRecord = async (
  zoneId: string,
  domainName: string,
  loadBalancerDNS: string,
  region?: string,
) => {
  const ALB_HOSTED_ZONE_IDS = {
    'us-east-1': 'Z35SXDOTRQ7X7K',
    'us-east-2': 'Z3AADJGX6KTTL2',
    'us-west-1': 'Z368ELLRRE2KJ0',
    'us-west-2': 'Z1H1FL5HABSF5',
    'af-south-1': 'Z268VQBMOI5EKX',
    'ap-east-1': 'Z3W0JX5SA6EZUG',
    'ap-south-1': 'ZP97RAFLXTNZK',
    'ap-northeast-1': 'Z14GRHDCWA56QT',
    'ap-northeast-2': 'Z3JE6OI9U60B6T',
    'ap-northeast-3': 'Z14YB7MMH6RZOD',
    'ap-southeast-1': 'Z1LMS91P8CMLE5',
    'ap-southeast-2': 'Z1GM3OXH4ZPM65',
    'ca-central-1': 'ZQ6VQB1LZSOJX',
    'eu-central-1': 'Z215JYRZR1TBD5',
    'eu-north-1': 'Z23TAZ6LKFMNIO',
    'eu-west-1': 'Z32O12XQLNTSW2',
    'eu-west-2': 'ZHURV8PSTC4K8',
    'eu-west-3': 'Z23RP1B8JEXSDF',
    'me-south-1': 'Z3QSRYVP46NYYV',
    'sa-east-1': 'Z2P70J7EXAMPLE',
    'us-gov-east-1': 'Z1Z4FKXC8NQMEK',
    'us-gov-west-1': 'Z18D5FSROUN65S',
    'il-central-1': 'Z3JTZABTB0E7KF',
  };

  const client = createClient<typeof Route53Client>(Route53Client, region);

  const params = {
    HostedZoneId: zoneId,
    ChangeBatch: {
      Changes: [
        {
          Action: 'CREATE',
          ResourceRecordSet: {
            Name: domainName,
            Type: 'A',
            AliasTarget: {
              DNSName: loadBalancerDNS,
              HostedZoneId:
                ALB_HOSTED_ZONE_IDS[
                  (await client.config.region()) as keyof typeof ALB_HOSTED_ZONE_IDS
                ],
              EvaluateTargetHealth: false,
            },
          },
        },
      ],
    },
  };

  try {
    const command = new ChangeResourceRecordSetsCommand(params);
    const response = await client.send(command);
    console.log('DNS Record Created:', response);
  } catch (error) {
    console.error('Error creating DNS record:', error);
  }
};

export const getZoneIdByDomain = async (
  domainName: string,
  region?: string,
) => {
  const client = createClient<typeof Route53Client>(Route53Client, region);
  const params = { DNSName: domainName, MaxItems: '1' };

  try {
    const command = new ListHostedZonesByNameCommand(params);
    const response = await client.send(command);

    const hostedZone = response.HostedZones[0];
    if (hostedZone && hostedZone.Name === `${domainName}.`) {
      const id = hostedZone.Id.split('/');
      return id[id.length - 1];
    } else {
      console.log(`No hosted zone found for domain ${domainName}`);
      return null;
    }
  } catch (error) {
    console.error(`Error retrieving hosted zone for ${domainName}:`, error);
    return null;
  }
};
