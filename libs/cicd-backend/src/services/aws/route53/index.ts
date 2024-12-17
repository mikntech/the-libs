import { createRequire } from 'module';
import { createClient } from '../utils';
const require = createRequire(import.meta.url);
const {
  Route53Client,
  CreateHostedZoneCommand,
  ChangeResourceRecordSetsCommand,
  ListHostedZonesByNameCommand,
} = require('@aws-sdk/client-route-53');

const {
  ElasticLoadBalancingV2Client,
  DescribeLoadBalancersCommand,
} = require('@aws-sdk/client-elastic-load-balancing-v2');

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
      keepID: response.HostedZone.Id.split('/').pop(),
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
  loadBalancerName: string,
  region?: string,
) => {
  const client = createClient<typeof Route53Client>(Route53Client, region);

  const getALBDnsName = async (loadBalancerName: string, region?: string) => {
    const elbv2Client = createClient<typeof ElasticLoadBalancingV2Client>(
      ElasticLoadBalancingV2Client,
      region,
    );
    const command = new DescribeLoadBalancersCommand({
      Names: [loadBalancerName],
    });

    try {
      const response = await elbv2Client.send(command);
      const loadBalancer = response.LoadBalancers[0];
      if (loadBalancer) {
        return loadBalancer.DNSName; // This is the full DNS name for the ALB
      } else {
        throw new Error(`Load balancer ${loadBalancerName} not found`);
      }
    } catch (error) {
      console.error(
        `Error retrieving DNS name for ALB ${loadBalancerName}:`,
        error,
      );
      return null;
    }
  };

  const getALBHostedZoneId = async (
    loadBalancerName: string,
    region?: string,
  ) => {
    const elbv2Client = createClient<typeof ElasticLoadBalancingV2Client>(
      ElasticLoadBalancingV2Client,
      region,
    );
    const command = new DescribeLoadBalancersCommand({
      Names: [loadBalancerName],
    });

    try {
      const response = await elbv2Client.send(command);
      const loadBalancer = response.LoadBalancers[0];
      if (loadBalancer) {
        return loadBalancer.CanonicalHostedZoneId;
      } else {
        throw new Error(`Load balancer ${loadBalancerName} not found`);
      }
    } catch (error) {
      console.error(
        `Error retrieving hosted zone ID for ALB ${loadBalancerName}:`,
        error,
      );
      return null;
    }
  };

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
              DNSName: await getALBDnsName(loadBalancerName, region),
              HostedZoneId: await getALBHostedZoneId(loadBalancerName, region),
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
      return hostedZone.Id.split('/').pop();
    } else {
      console.log(`No hosted zone found for domain ${domainName}`);
      return null;
    }
  } catch (error) {
    console.error(`Error retrieving hosted zone for ${domainName}:`, error);
    return null;
  }
};
