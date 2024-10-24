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

const DOMAIN = 'couple-link.com';
const DEP_REGION = 'eu-central-1';
const projectName = 'cl';
const apps = [
  {
    name: 'server',
    port: 3321,
    domain: DOMAIN,
    exactFully: {
      prod: 'server.couple-link.com',
      preprod: 'preserver.couple-link.com',
    },
  },
  {
    name: 'client',
    port: 5173,
    domain: DOMAIN,
    exactFully: {
      prod: 'couple-link.com',
      preprod: 'pre.couple-link.com',
    },
  },
];
const appNames = apps.map(({ name }) => name);
const nodeTag = '18.20.4';

const stagingENVs: (keyof typeof Staging)[] = ['prod', 'preprod'];

const step1initDNSinitECRGenerateYMLsSSHDockerfilesClustesS3 = async () => {
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
                name: longName === 'prod' ? 'prd - release/prod' : 'prp - main',
                branchName: longName === 'prod' ? 'release/prod' : 'main',
                clusterName: longName,
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

const step2ARNsServices = async () => {
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
              /* 'mik' + */ prefix + name,
              port,
              certificateARNs[index],
            ),
        ),
      );
    }),
  );
};

const step3cpvSecurity = async () => {
  const vpcId = await getDefaultVpcId();
  const securityGroupId = await getDefaultSecurityGroupId(vpcId);

  await updateSecurityGroupInboundRules(securityGroupId);
};

const step4DNSRecords = async () => {
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

// step2ARNsServices(); /*.then(() => setTimeout(() => , 3000));*/
// step4DNSRecords();

//

//

//

//

//

//

//
