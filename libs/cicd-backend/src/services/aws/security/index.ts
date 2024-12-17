import { createRequire } from 'module';
import { createClient } from '../..';

const require = createRequire(import.meta.url);
const {
  EC2Client,
  AuthorizeSecurityGroupIngressCommand,
  DescribeSecurityGroupsCommand,
  RevokeSecurityGroupIngressCommand,
} = require('@aws-sdk/client-ec2');

export const updateSecurityGroupInboundRules = async (
  securityGroupId: string,
) => {
  const ec2Client = new EC2Client({});

  try {
    // Step 1: Get current security group rules
    const describeCommand = new DescribeSecurityGroupsCommand({
      GroupIds: [securityGroupId],
    });
    const describeResponse = await ec2Client.send(describeCommand);

    const securityGroup = describeResponse.SecurityGroups?.[0];
    if (!securityGroup || !securityGroup.IpPermissions) {
      throw new Error('Security group not found or no inbound rules.');
    }

    // Step 2: Revoke all existing inbound rules
    if (securityGroup.IpPermissions.length > 0) {
      const revokeCommand = new RevokeSecurityGroupIngressCommand({
        GroupId: securityGroupId,
        IpPermissions: securityGroup.IpPermissions, // Revoke all existing inbound rules
      });
      await ec2Client.send(revokeCommand);
      console.log('Existing inbound rules revoked.');
    }

    // Step 3: Add new rules
    const newRulesParams = {
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
        {
          IpProtocol: '-1',
          UserIdGroupPairs: [
            {
              GroupId: securityGroupId,
              Description: 'Allow all traffic within the security group',
            },
          ],
        },
      ],
    };

    const authorizeCommand = new AuthorizeSecurityGroupIngressCommand(
      newRulesParams,
    );
    const response = await ec2Client.send(authorizeCommand);
    console.log('New inbound rules added:', response);
  } catch (error) {
    console.error('Error updating security group:', error);
  }
};
