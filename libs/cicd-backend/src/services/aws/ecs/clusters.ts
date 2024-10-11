import { createRequire } from 'module';
import { createClient, ecsClusterTemplateGenerator } from '../..';
const require = createRequire(import.meta.url);

const {
  CloudFormationClient,
  CreateStackCommand,
} = require('@aws-sdk/client-cloudformation');

export const createECSCluster = async (
  clusterName: string,
  insights = false,
  namespace = clusterName,
) => {
  const client =
    createClient<typeof CloudFormationClient>(CloudFormationClient);

  const template = ecsClusterTemplateGenerator(
    clusterName,
    insights,
    namespace,
  );
  const params = {
    StackName: `mik-created-ECS-Cluster-${clusterName}`,
    TemplateBody: JSON.stringify(template),
    Parameters: [],
    Capabilities: ['CAPABILITY_NAMED_IAM'],
  };

  try {
    const command = new CreateStackCommand(params);
    const response = await client.send(command);
    console.log('ECS Cluster Stack Creation Initiated:', response);
    return response;
  } catch (error) {
    console.error('Error creating ECS cluster stack:', error);
  }
};
