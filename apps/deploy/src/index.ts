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

await createHostedZone(DOMAIN);
enableRegion(DEP_REGION);
createMultipleECRRepositories(projectName, appNames, DEP_REGION).then();
await getEcrUri(false);
const ecrUri = await getEcrUri();
generateYML(
  {
    appNames,
  },
  'michael@cubebox.co.il',
  projectName,
  DEP_REGION,
);
await generateSSHKey();
generateBaseDockerfile({ nodeTag });
generateCustomServerDockerfile(
  { nodeTag, customBuildLine: 'RUN npx nx build ' + appNames[0] },
  projectName,
  appNames[0],
  ecrUri,
  4348,
);
generateStandaloneNextDockerfile(
  {},
  projectName,
  await getEcrUri(),
  appNames[1],
);
stagingENVs.forEach((env) => createECSCluster(env, env === 'prod'));
apps.forEach(({ name, port }) => createTaskDefinition(name, port));
createS3Bucket('cubebox-prod', true).then();
createS3Bucket('cubebox-preprod').then();
const certificateARNs = await Promise.all(
  apps.map(async ({ domain }) => await requestCertificate(domain)),
);

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
        ':1',
      port,
      certificateARNs[index],
    ),
);

const vpcId = await getDefaultVpcId();
const securityGroupId = await getDefaultSecurityGroupId(vpcId);

await updateSecurityGroupInboundRules(securityGroupId);

apps.map(
  async ({ name }) =>
    await createDNSRecord(
      DEP_REGION,
      await getZoneIdByDomain(DOMAIN),
      `${name}.your-load-balancer.amazonaws.com`,
    ),
);
