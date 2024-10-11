import { createRequire } from 'module';
import { createClient, ecsServiceTemplateGenerator } from '../..';
const require = createRequire(import.meta.url);

const {
  CloudFormationClient,
  CreateStackCommand,
} = require('@aws-sdk/client-cloudformation');
const {
  EC2Client,
  DescribeSecurityGroupsCommand,
  DescribeVpcsCommand,
  DescribeSubnetsCommand,
} = require('@aws-sdk/client-ec2');

const getDefaultVpcId = async () => {
  const ec2Client = createClient<typeof EC2Client>(EC2Client);
  const command = new DescribeVpcsCommand({
    Filters: [{ Name: 'isDefault', Values: ['true'] }],
  });
  const response = await ec2Client.send(command);
  return response.Vpcs[0].VpcId;
};

const getDefaultSecurityGroupId = async (defaultVpcId: string) => {
  try {
    const ec2Client = createClient<typeof EC2Client>(EC2Client);
    const command = new DescribeSecurityGroupsCommand({
      Filters: [
        { Name: 'vpc-id', Values: [defaultVpcId] },
        { Name: 'group-name', Values: ['default'] },
      ],
    });
    const response = await ec2Client.send(command);
    return response.SecurityGroups[0].GroupId;
  } catch (error) {
    console.error('Error retrieving default security group:', error);
  }
};

const getAllSubnetIds = async (defaultVpcId: string) => {
  try {
    const ec2Client = createClient<typeof EC2Client>(EC2Client);
    const command = new DescribeSubnetsCommand({
      Filters: [{ Name: 'vpc-id', Values: [defaultVpcId] }],
    });
    const response = await ec2Client.send(command);
    return response.Subnets.map(
      (subnet: { SubnetId: string }) => subnet.SubnetId,
    );
  } catch (error) {
    console.error('Error retrieving subnets:', error);
  }
};

export const createECSService = async (
  appName: string,
  clusterName: string,
  taskDefinitionArn: string,
  port: number,
  acmArn: string,
  spinsDown: boolean = false,
) => {
  const cloudFormationClient =
    createClient<typeof CloudFormationClient>(CloudFormationClient);

  const defaultVpcId = await getDefaultVpcId();
  const defaultSecurityGroupId = await getDefaultSecurityGroupId(defaultVpcId);
  const subnetIds = await getAllSubnetIds(defaultVpcId);

  const template = ecsServiceTemplateGenerator(
    appName,
    clusterName,
    defaultSecurityGroupId,
    subnetIds,
    defaultVpcId,
    taskDefinitionArn,
    port,
    acmArn,
    spinsDown,
  );

  const params = {
    StackName: `MIK-ECS-Service-${appName}`,
    TemplateBody: JSON.stringify(template),
    Parameters: [],
    Capabilities: ['CAPABILITY_NAMED_IAM'],
  };

  try {
    const command = new CreateStackCommand(params);
    const response = await cloudFormationClient.send(command);
    console.log('ECS Service Stack Creation Initiated:', response);
    return response;
  } catch (error) {
    console.error('Error creating ECS service stack:', error);
  }
};
