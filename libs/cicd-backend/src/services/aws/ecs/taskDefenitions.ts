import { createRequire } from 'module';
import { createClient } from '../..';
import { TODO } from '@the-libs/base-shared';
const require = createRequire(import.meta.url);

const {
  ECSClient,
  RegisterTaskDefinitionCommand,
} = require('@aws-sdk/client-ecs');
const {
  IAMClient,
  ListRolesCommand,
  CreateRoleCommand,
  AttachRolePolicyCommand,
  ListAttachedRolePoliciesCommand,
} = require('@aws-sdk/client-iam');

export const createTaskDefinition = async (
  appName: string,
  port: number,
  environment: { name: string; value: string }[] = [],
) => {
  const escClient = createClient<typeof ECSClient>(ECSClient);
  const iamClient = createClient<typeof IAMClient>(IAMClient);

  const ecsPolicyArn =
    'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy';

  const findECSRole = async () => {
    try {
      const listRolesCommand = new ListRolesCommand({});
      const rolesResponse = await iamClient.send(listRolesCommand);

      for (const role of rolesResponse.Roles) {
        const listPoliciesCommand = new ListAttachedRolePoliciesCommand({
          RoleName: role.RoleName,
        });
        const policiesResponse = await iamClient.send(listPoliciesCommand);

        const hasECSPolicy = policiesResponse.AttachedPolicies.some(
          (policy: TODO) => policy.PolicyArn === ecsPolicyArn,
        );
        if (hasECSPolicy) {
          console.log('Found existing ECS-compatible role:', role.Arn);
          return role.Arn;
        }
      }

      console.log('No ECS-compatible role found. A new role will be created.');
      return null;
    } catch (error) {
      console.error('Error finding ECS role:', error);
      throw error;
    }
  };

  const createRole = async (roleName: string) => {
    const assumeRolePolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { Service: 'ecs-tasks.amazonaws.com' },
          Action: 'sts:AssumeRole',
        },
      ],
    };

    const createRoleParams = {
      RoleName: roleName,
      AssumeRolePolicyDocument: JSON.stringify(assumeRolePolicy),
      Description: 'Role for ECS task execution',
    };

    try {
      const createRoleCommand = new CreateRoleCommand(createRoleParams);
      const createRoleResponse = await iamClient.send(createRoleCommand);
      console.log('Role created:', createRoleResponse.Role.Arn);

      // Attach the AmazonECSTaskExecutionRolePolicy
      const attachPolicyCommand = new AttachRolePolicyCommand({
        RoleName: roleName,
        PolicyArn: ecsPolicyArn,
      });
      await iamClient.send(attachPolicyCommand);
      console.log('Policy attached to role:', roleName);

      return createRoleResponse.Role.Arn;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  };

  let taskRoleArn = await findECSRole();
  if (!taskRoleArn) {
    taskRoleArn = await createRole('ecsTaskExecutionRole');
  }
  const params = {
    family: 'mik' + appName,
    networkMode: 'awsvpc',
    requiresCompatibilities: ['FARGATE'],
    cpu: '1024',
    memory: '3072',
    executionRoleArn: taskRoleArn,
    containerDefinitions: [
      {
        name: 'mik' + appName,
        image: 'mikerroruntilactions',
        cpu: 0,
        essential: true,
        portMappings: [
          {
            name: appName + '-' + String(port) + '-tcp',
            containerPort: port,
            hostPort: port,
            protocol: 'tcp',
            appProtocol: 'http',
          },
        ],
        environment,
        environmentFiles: [],
        mountPoints: [],
        volumesFrom: [],
        ulimits: [],
        logConfiguration: {
          logDriver: 'awslogs',
          options: {
            'awslogs-group': '/ecs/mik' + appName,
            mode: 'non-blocking',
            'awslogs-create-group': 'true',
            'max-buffer-size': '25m',
            'awslogs-region': await escClient.config.region(),
            'awslogs-stream-prefix': 'ecs',
          },
          secretOptions: [],
        },
        systemControls: [],
      },
    ],
    volumes: [],
    runtimePlatform: {
      cpuArchitecture: 'X86_64',
      operatingSystemFamily: 'LINUX',
    },
  };

  try {
    const command = new RegisterTaskDefinitionCommand(params);
    const response = await escClient.send(command);
    console.log('Task Definition Registered Successfully:', response);
    return response;
  } catch (error) {
    console.error('Error registering task definition:', error);
  }
};
