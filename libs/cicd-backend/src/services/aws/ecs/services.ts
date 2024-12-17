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
const {
  ECSClient,
  ListTaskDefinitionsCommand,
  DescribeTaskDefinitionCommand,
} = require('@aws-sdk/client-ecs');

export const getDefaultVpcId = async () => {
  const ec2Client = createClient<typeof EC2Client>(EC2Client);
  const command = new DescribeVpcsCommand({
    Filters: [{ Name: 'isDefault', Values: ['true'] }],
  });
  const response = await ec2Client.send(command);
  return response.Vpcs[0].VpcId;
};

export const getDefaultSecurityGroupId = async (defaultVpcId: string) => {
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
    
  }
};

export const getAllSubnetIds = async (defaultVpcId: string) => {
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
    
  }
};

export const getLatestTaskDefinitionArn = async (familyPrefix: string) => {
  try {
    const ecsClient = createClient<typeof ECSClient>(ECSClient);

    const listCommand = new ListTaskDefinitionsCommand({
      familyPrefix,
      sort: 'DESC',
      maxResults: 1,
    });

    const listResponse = await ecsClient.send(listCommand);

    if (
      !listResponse.taskDefinitionArns ||
      listResponse.taskDefinitionArns.length === 0
    ) {
      throw new Error('No task definitions found for the specified family');
    }

    const latestTaskDefinitionArn = listResponse.taskDefinitionArns[0];

    const describeCommand = new DescribeTaskDefinitionCommand({
      taskDefinition: latestTaskDefinitionArn,
    });

    const describeResponse = await ecsClient.send(describeCommand);

    
      'Latest Task Definition Details:',
      describeResponse.taskDefinition,
    );

    return latestTaskDefinitionArn;
  } catch (error) {
    
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
    await getLatestTaskDefinitionArn(taskDefinitionArn),
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
    
    return response;
  } catch (error) {
    
  }
};
