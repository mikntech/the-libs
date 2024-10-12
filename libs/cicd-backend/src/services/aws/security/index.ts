import { createRequire } from 'module';
import { createClient } from '../..';

const require = createRequire(import.meta.url);
const {
  EC2Client,
  AuthorizeSecurityGroupIngressCommand,
} = require('@aws-sdk/client-ec2');

const updateSecurityGroupInboundRules = async (securityGroupId: string) => {
  const ec2Client = createClient<typeof EC2Client>(EC2Client);
  const params = {
    GroupId: securityGroupId,
    IpPermissions: [
      {
        IpProtocol: 'tcp',
        FromPort: 80,
        ToPort: 80,
        IpRanges: [
          { CidrIp: '0.0.0.0/0', Description: 'Allow HTTP from any IP' },
        ],
      },
      {
        IpProtocol: 'tcp',
        FromPort: 443,
        ToPort: 443,
        IpRanges: [
          { CidrIp: '0.0.0.0/0', Description: 'Allow HTTPS from any IP' },
        ],
      },
    ],
  };

  try {
    const command = new AuthorizeSecurityGroupIngressCommand(params);
    const response = await ec2Client.send(command);
    console.log('Security Group Updated:', response);
  } catch (error) {
    console.error('Error updating security group:', error);
  }
};
