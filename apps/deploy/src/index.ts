import {
  createHostedZone,
  createMultipleECRRepositories,
  enableRegion,
  generateCustomServerDockerfile,
  generateBaseDockerfile,
  generateSSHKey,
  generateYML,
  getEcrUri,
  generateStandaloneNextDockerfile,
  createECSCluster,
  createTaskDefinition,
  createECSService,
  getDefaultVpcId,
  getDefaultSecurityGroupId,
  createDNSRecord,
  getZoneIdByDomain,
  cicdSettings,
  generateClientDockerfile,
} from '@the-libs/cicd-backend';
import { createS3Bucket } from '../../../libs/cicd-backend/src/services/aws/s3';
import { requestCertificate } from '../../../libs/cicd-backend/src/services/aws/acm';
import { updateSecurityGroupInboundRules } from '../../../libs/cicd-backend/src/services/aws/security';
import { printLongText } from '@the-libs/base-shared';
import { AppType } from '@the-libs/project-generator';

enum Staging {
  'prod' = 'prod',
  'preprod' = 'pre',
  'tst' = 'tst',
  'dev' = 'dev',
}

const step1initDNSinitECRGenerateYMLsSSHDockerfilesClustersS3 = async (
  DOMAIN: string,
  DEP_REGION: string,
  projectName: string,
  apps: {
    name: string;
    port: number;
    domain: string;
    type: AppType;
    exactFully: { [key in Staging]: string };
  }[],
  stagingENVs: (keyof typeof Staging)[],
  nodeTag: string,
) => {
  const appNames = apps.map(({ name }) => name);

  await createHostedZone(DOMAIN);
  enableRegion(DEP_REGION);

  await createMultipleECRRepositories(projectName, appNames, DEP_REGION);

  const ecrUri = await getEcrUri();
  
    printLongText(
      (
        await Promise.all(
          stagingENVs.map((envKey: keyof typeof Staging) =>
            generateYML(
              {
                appNames,
                name: envKey === 'prod' ? 'prd - release/prod' : 'prp - main',
                branchName: envKey === 'prod' ? 'release/prod' : 'main',
                clusterName: envKey,
                log: false,
              },
              'michael@couple-link.com',
              projectName,
              DEP_REGION,
            ),
          ),
        )
      ).join('\n\n\n\n\n\n'),
    ),
  );
  await generateSSHKey();

  generateBaseDockerfile({ nodeTag });

  await Promise.all(
    apps.map(async ({ name, port, type }) => {
      switch (type) {
        case AppType.Server:
          generateCustomServerDockerfile(
            { nodeTag, customBuildLine: 'RUN npx nx build ' + name },
            projectName,
            name,
            ecrUri,
            port,
          );
          break;
        case AppType.Client:
          generateClientDockerfile(
            {},
            projectName,
            await getEcrUri(),
            appNames[0],
            apps[0].port,
          );
          break;
        case AppType.Next:
          generateStandaloneNextDockerfile(
            {},
            projectName,
            await getEcrUri(),
            appNames[0],
            apps[0].port,
          );
          break;
      }
    }),
  );

  await Promise.all(
    stagingENVs.map(async (env) => await createECSCluster(env, env === 'prod')),
  );
  await Promise.all(
    stagingENVs.map(
      async (env) =>
        await Promise.all(
          apps.map(
            async ({ name, port }) =>
              await createTaskDefinition(
                env === Staging.prod ? name : env + name,
                port,
              ),
          ),
        ),
    ),
  );
  /* await Promise.all(
    stagingENVs.map(
      async (envKey) => await createS3Bucket('-' + envKey, true),
    ),
  );*/
};

const step2ARNsServices = async (
  apps: {
    name: string;
    port: number;
    domain: string;
    type: AppType;
    exactFully: { [key in Staging]: string };
  }[],
  stagingENVs: (keyof typeof Staging)[],
) => {
  await Promise.all(
    stagingENVs.map(async (envKey) => {
      const prefix = envKey === 'prod' ? '' : Staging[envKey];
      const certificateARNs = await Promise.all(
        apps.map(async ({ name, exactFully }) => {
          if (!exactFully[Staging[envKey]])
            throw new Error('exactFully is must for ' + name + ' ' + envKey);
          return await requestCertificate(exactFully[Staging[envKey]]);
        }),
      );

      await Promise.all(
        apps.map(
          async ({ name, port }, index) =>
            await createECSService(
              prefix + name,
              envKey,
              'mik' + (envKey === 'prod' ? '' : envKey) + name,
              port,
              certificateARNs[index],
            ),
        ),
      );
    }),
  );
};

const step3DNSRecords = async (
  DOMAIN: string,
  apps: {
    name: string;
    port: number;
    domain: string;
    type: AppType;
    exactFully: { [key in Staging]: string };
  }[],
  stagingENVs: (keyof typeof Staging)[],
) => {
  const vpcId = await getDefaultVpcId();
  const securityGroupId = await getDefaultSecurityGroupId(vpcId);
  await updateSecurityGroupInboundRules(securityGroupId);
  await Promise.all(
    stagingENVs.map(async (envKey) => {
      await Promise.all(
        apps.map(
          async ({ name, exactFully }) =>
            await createDNSRecord(
              await getZoneIdByDomain(DOMAIN),
              exactFully[Staging[envKey]] ||
                (name === 'client' ? '' : name + '.') + DOMAIN,
              'mik' + (envKey === 'prod' ? '' : Staging[envKey]) + name + 'lb',
            ),
        ),
      );
    }),
  );
};

//

//

//

//

//

const DOMAIN = 'mikntech.com';
const DEP_REGION = 'ca-central-1';
if (cicdSettings.aws.region !== DEP_REGION)
  throw new Error('DEP_REGION is not like process.env.AWS_REGION!!!');
const projectName = 'mn';
const apps = [
  {
    name: 'mikntech',
    port: 3000,
    domain: DOMAIN,
    type: AppType.Next,
    exactFully: {
      [Staging.prod]: 'mikntech.com',
      [Staging.preprod]: '',
      [Staging.tst]: '',
      [Staging.dev]: '',
    },
  },
];
const nodeTag = '18.20.4';

const stagingENVs: (keyof typeof Staging)[] = ['prod'];

/*
await step1initDNSinitECRGenerateYMLsSSHDockerfilesClustersS3(
  DOMAIN,
  DEP_REGION,
  projectName,
  apps,
  stagingENVs,
  nodeTag,
);

//
//
*/
/*
await step2ARNsServices(apps, stagingENVs).then();
setTimeout(() => step3DNSRecords(DOMAIN, apps, stagingENVs).then(), 20000);
*/

//

//

//

//

//

//

//
