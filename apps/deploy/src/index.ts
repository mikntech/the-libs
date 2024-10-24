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
  getAccountId,
} from '@the-libs/cicd-backend';
import { createS3Bucket } from '../../../libs/cicd-backend/src/services/aws/s3';
import { requestCertificate } from '../../../libs/cicd-backend/src/services/aws/acm';
import { updateSecurityGroupInboundRules } from '../../../libs/cicd-backend/src/services/aws/security';
import { printLongText } from '@the-libs/base-shared';

enum Staging {
  'prod' = 'prod',
  'preprod' = 'pre',
  'tst' = 'tst',
  'dev' = 'dev',
}

const DOMAIN = 'mikntech.com';
const DEP_REGION = 'ca-central-1';
const projectName = 'mn';
const apps = [
  {
    name: 'mikntech',
    port: 4222,
    domain: DOMAIN,
    exactFully: {},
  },
];
const appNames = apps.map(({ name }) => name);
const nodeTag = '18.20.4';

const stagingENVs: (keyof typeof Staging)[] = ['prod'];

const step1 = async () => {
  await createHostedZone(DOMAIN);
  enableRegion(DEP_REGION);

  await createMultipleECRRepositories(projectName, appNames, DEP_REGION);

  const ecrUri = await getEcrUri();
  console.log(
    printLongText(
      (
        await Promise.all(
          stagingENVs.map((longName: keyof typeof Staging) =>
            generateYML(
              {
                appNames,
                name: longName === 'prod' ? 'deploy_mikntech' : 'prp - main',
                branchName: longName === 'prod' ? 'main' : 'main',
                clusterName: longName,
                log: false,
              },
              'michael@mikntech.com',
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

  generateCustomServerDockerfile(
    { nodeTag, customBuildLine: 'RUN npx nx build ' + appNames[0] },
    projectName,
    appNames[0],
    ecrUri,
    apps[0].port,
  );
  generateStandaloneNextDockerfile(
    {},
    projectName,
    await getEcrUri(),
    appNames[0],
    apps[0].port,
  );

  await Promise.all(
    stagingENVs.map(async (env) => await createECSCluster(env, env === 'prod')),
  );
  await Promise.all(
    apps.map(async ({ name, port }) => await createTaskDefinition(name, port)),
  );
  await Promise.all(
    stagingENVs.map(
      async (longName) => await createS3Bucket('cubebox-' + longName, true),
    ),
  );
};

const step2 = async () => {
  await Promise.all(
    stagingENVs.map(async (longName) => {
      const prefix = longName === 'prod' ? '' : Staging[longName];

      const certificateARNs = await Promise.all(
        apps.map(
          async ({ domain, exactFully }) =>
            await requestCertificate(exactFully[longName] || prefix + domain),
        ),
      );

      await Promise.all(
        apps.map(
          async ({ name, port }, index) =>
            await createECSService(
              prefix + name,
              longName,
              'arn:aws:ecs:' +
                DEP_REGION +
                ':' +
                (await getAccountId()) +
                ':task-definition/mik' +
                prefix +
                name +
                ':' +
                (prefix === ''
                  ? name === 'mikntech'
                    ? 2
                    : 16
                  : name === 'server'
                    ? 5
                    : 3),
              port,
              certificateARNs[index],
            ),
        ),
      );
    }),
  );
};

const step3 = async () => {
  const vpcId = await getDefaultVpcId();
  const securityGroupId = await getDefaultSecurityGroupId(vpcId);

  await updateSecurityGroupInboundRules(securityGroupId);
};

const step4 = async () => {
  await Promise.all(
    stagingENVs.map(async (longName) => {
      apps.map(
        async ({ name, exactFully }) =>
          await createDNSRecord(
            await getZoneIdByDomain(DOMAIN),
            exactFully[longName] ||
              (name === 'client' ? '' : name + '.') + DOMAIN,
            'mik' +
              (longName === 'prod' ? '' : Staging[longName]) +
              name +
              'lb',
          ),
      );
    }),
  );
};

console.log(
  printLongText(
    (
      await Promise.all(
        stagingENVs.map((longName: keyof typeof Staging) =>
          generateYML(
            {
              appNames,
              name: longName === 'prod' ? 'deploy_mikntech' : 'prp - main',
              branchName: longName === 'prod' ? 'main' : 'main',
              clusterName: longName,
              log: false,
            },
            'michael@mikntech.com',
            projectName,
            DEP_REGION,
          ),
        ),
      )
    ).join('\n\n\n\n\n\n'),
  ),
);

//

//

//

//

//

//

//
