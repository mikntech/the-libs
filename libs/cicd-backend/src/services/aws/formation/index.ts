export const ecsClusterTemplateGenerator = (
  clusterName: string,
  insights: boolean,
  namespace: string = clusterName,
) => ({
  AWSTemplateFormatVersion: '2010-09-09',
  Description:
    'The template used to create an ECS Cluster from the ECS Console, upgraded my mik',
  Parameters: {
    ECSClusterName: {
      Type: 'String',
      Description:
        'Specifies the ECS Cluster Name with which the resources would be associated',
      Default: 'mik' + clusterName,
    },
    SecurityGroupIds: {
      Type: 'CommaDelimitedList',
      Description:
        'Optional - Specifies the Comma separated list of the Security Group Id of an existing Security Group.',
      Default: '',
    },
    VpcId: {
      Type: 'String',
      Description:
        'Optional - Specifies the ID of an existing VPC in which to launch your container instances. If you specify a VPC ID, you must specify a list of existing subnets in that VPC. If you do not specify a VPC ID, a new VPC is created with at least 1 subnet.',
      Default: '',
      AllowedPattern: '^(?:vpc-[0-9a-f]{8,17}|)$',
      ConstraintDescription:
        "VPC Id must begin with 'vpc-' and have a valid uuid",
    },
    SubnetIds: {
      Type: 'CommaDelimitedList',
      Description:
        'Optional - Specifies the Comma separated list of existing VPC Subnet Ids where ECS instances will run',
      Default: '',
    },
    LatestECSOptimizedAMI: {
      Description: 'AMI ID',
      Type: 'AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>',
      Default:
        '/aws/service/ecs/optimized-ami/amazon-linux-2/kernel-5.10/recommended/image_id',
    },
  },
  Resources: {
    ECSCluster: {
      Type: 'AWS::ECS::Cluster',
      Properties: {
        ClusterName: {
          Ref: 'ECSClusterName',
        },
        CapacityProviders: ['FARGATE', 'FARGATE_SPOT'],
        ClusterSettings: [
          {
            Name: 'containerInsights',
            Value: insights ? 'enabled' : 'disabled',
          },
        ],
        ServiceConnectDefaults: {
          Namespace: 'mik' + namespace,
        },
        Tags: [],
      },
    },
  },
  Outputs: {
    ECSCluster: {
      Description: 'The created cluster.',
      Value: {
        Ref: 'ECSCluster',
      },
    },
  },
});

export const ecsServiceTemplateGenerator = (
  appName: string,
  clusterName: string,
  securityGroup: string,
  subnets: string[],
  vpc: string,
  containerName: string,
  taskDefinitionArn: string,
  port: number,
  acmArn: string,
  spinsDown: boolean,
) => ({
  AWSTemplateFormatVersion: '2010-09-09',
  Description:
    'The template used to create an ECS Service from the ECS Console, upgraded my mik',
  Parameters: {
    ECSClusterName: {
      Type: 'String',
      Default: 'mik' + clusterName,
    },
    ECSServiceName: {
      Type: 'String',
      Default: 'mik' + appName,
    },
    SecurityGroupIDs: {
      Type: 'CommaDelimitedList',
      Default: securityGroup,
    },
    SubnetIDs: {
      Type: 'CommaDelimitedList',
      Default: subnets.join(','),
    },
    VpcID: {
      Type: 'String',
      Default: vpc,
    },
    LoadBalancerName: {
      Type: 'String',
      Default: 'mik' + appName + 'lb',
    },
  },
  Resources: {
    ECSService: {
      Type: 'AWS::ECS::Service',
      Properties: {
        Cluster: 'mik' + clusterName,
        CapacityProviderStrategy: [
          {
            CapacityProvider: 'FARGATE',
            Base: 0,
            Weight: 1,
          },
        ],
        TaskDefinition: taskDefinitionArn,
        ServiceName: 'mik' + appName,
        SchedulingStrategy: 'REPLICA',
        DesiredCount: 1,
        LoadBalancers: [
          {
            ContainerName: containerName,
            ContainerPort: port,
            LoadBalancerName: {
              Ref: 'AWS::NoValue',
            },
            TargetGroupArn: {
              Ref: 'TargetGroup',
            },
          },
        ],
        NetworkConfiguration: {
          AwsvpcConfiguration: {
            AssignPublicIp: 'ENABLED',
            SecurityGroups: {
              Ref: 'SecurityGroupIDs',
            },
            Subnets: {
              Ref: 'SubnetIDs',
            },
          },
        },
        PlatformVersion: 'LATEST',
        DeploymentConfiguration: {
          MaximumPercent: 300,
          MinimumHealthyPercent: spinsDown ? 0 : 100,
          DeploymentCircuitBreaker: {
            Enable: true,
            Rollback: true,
          },
        },
        DeploymentController: {
          Type: 'ECS',
        },
        ServiceConnectConfiguration: {
          Enabled: false,
        },
        Tags: [],
        EnableECSManagedTags: true,
      },
      DependsOn: ['ListenerHTTP', 'ListenerHTTPS'],
    },
    LoadBalancer: {
      Type: 'AWS::ElasticLoadBalancingV2::LoadBalancer',
      Properties: {
        Type: 'application',
        Name: 'mik' + appName + 'lb',
        SecurityGroups: {
          Ref: 'SecurityGroupIDs',
        },
        Subnets: {
          Ref: 'SubnetIDs',
        },
      },
    },
    TargetGroup: {
      Type: 'AWS::ElasticLoadBalancingV2::TargetGroup',
      Properties: {
        HealthCheckPath: '/',
        Name: 'ecs-mikpro-' + appName + 'tg',
        Port: 80,
        Protocol: 'HTTP',
        TargetType: 'ip',
        HealthCheckProtocol: 'HTTP',
        VpcId: {
          Ref: 'VpcID',
        },
        TargetGroupAttributes: [
          {
            Key: 'deregistration_delay.timeout_seconds',
            Value: '300',
          },
        ],
      },
    },
    ListenerHTTPS: {
      Type: 'AWS::ElasticLoadBalancingV2::Listener',
      Properties: {
        DefaultActions: [
          { Type: 'forward', TargetGroupArn: { Ref: 'TargetGroup' } },
        ],
        LoadBalancerArn: { Ref: 'LoadBalancer' },
        Port: 443,
        Protocol: 'HTTPS',
        Certificates: [{ CertificateArn: acmArn }],
      },
    },
    ListenerHTTP: {
      Type: 'AWS::ElasticLoadBalancingV2::Listener',
      Properties: {
        DefaultActions: [
          {
            Type: 'redirect',
            RedirectConfig: {
              Protocol: 'HTTPS',
              Port: '443',
              StatusCode: 'HTTP_301',
            },
          },
        ],
        LoadBalancerArn: { Ref: 'LoadBalancer' },
        Port: 80,
        Protocol: 'HTTP',
      },
    },
  },
  Outputs: {
    ClusterName: {
      Description: 'The cluster used to create the service.',
      Value: {
        Ref: 'ECSClusterName',
      },
    },
    ECSService: {
      Description: 'The created service.',
      Value: {
        Ref: 'ECSService',
      },
    },
    LoadBalancer: {
      Description: 'The created load balancer.',
      Value: {
        Ref: 'LoadBalancer',
      },
    },
    ListenerHTTP: {
      Description: 'The HTTP listener for redirecting traffic to HTTPS.',
      Value: { Ref: 'ListenerHTTP' },
    },
    ListenerHTTPS: {
      Description: 'The HTTPS listener handling secure traffic.',
      Value: { Ref: 'ListenerHTTPS' },
    },
    TargetGroup: {
      Description: 'The created target group.',
      Value: {
        Ref: 'TargetGroup',
      },
    },
  },
});
