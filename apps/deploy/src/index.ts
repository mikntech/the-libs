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

const DOMAIN = 'cubebox.co.il';
const DEP_REGION = 'il-central-1';
const projectName = 'cb';
const apps = [
  { name: 'server', port: 4050, domain: 'server.cubebox.co.il' },
  { name: 'client', port: 3000, domain: 'cubebox.co.il' },
];
const appNames = apps.map(({ name }) => name);
const nodeTag = '18.20.4';
const stagingENVs = ['prod', 'preprod'];
const step1 = async () => {
  await createHostedZone(DOMAIN);
  enableRegion(DEP_REGION);

  await createMultipleECRRepositories(projectName, appNames, DEP_REGION);

  const ecrUri = await getEcrUri();

  console.log(
    generateYML(
      {
        appNames,
      },
      'michael@cubebox.co.il',
      projectName,
      DEP_REGION,
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
    appNames[1],
    apps[1].port,
  );

  await Promise.all(
    stagingENVs.map(async (env) => await createECSCluster(env, env === 'prod')),
  );
  await Promise.all(
    apps.map(async ({ name, port }) => await createTaskDefinition(name, port)),
  );
  await Promise.all(
    stagingENVs.map(
      async (env) => await createS3Bucket('cubebox-' + env, true),
    ),
  );
};
const step2 = async () => {
  const certificateARNs = await Promise.all(
    apps.map(async ({ domain }) => await requestCertificate(domain)),
  );

  await Promise.all(
    apps.map(
      async ({ name, port }, index) =>
        await createECSService(
          name,
          'prod',
          'arn:aws:ecs:' +
            DEP_REGION +
            ':' +
            (await getAccountId()) +
            ':task-definition/mik' +
            name +
            ':' +
            (name === 'server' ? 22 : 16),
          port,
          certificateARNs[index],
        ),
    ),
  );

  const vpcId = await getDefaultVpcId();
  const securityGroupId = await getDefaultSecurityGroupId(vpcId);

  await updateSecurityGroupInboundRules(securityGroupId);
};

const step3 = async () => {
  apps.map(
    async ({ name }) =>
      await createDNSRecord(
        await getZoneIdByDomain(DOMAIN),
        (name === 'client' ? '' : name + '.') + DOMAIN,
        'mik' + name + 'lb',
      ),
  );
};
