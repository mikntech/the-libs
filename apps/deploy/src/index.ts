import {
  createECRRepository,
  createHostedZone,
  createMultipleECRRepositories,
  enableRegion,
  generateCustomServerDockerfile,
  generateBaseDockerfile,
  generateSSHKey,
  generateYML,
  getEcrUri,
  generateStandaloneNextDockerfile,
  ecsClusterTemplateGenerator,
  createECSCluster,
  createTaskDefinition,
  createECSService,
} from '@the-libs/cicd-backend';
import { createS3Bucket } from '../../../libs/cicd-backend/src/services/aws/s3';
import { requestCertificate } from '../../../libs/cicd-backend/src/services/aws/acm';

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

// createHostedZone(DOMAIN);
// enableRegion(DEP_REGION);
//createMultipleECRRepositories(projectName, appNames, DEP_REGION);
// await getEcrUri(false);
//const ecrUri = await getEcrUri();
/*generateYML(
  {
    appNames,
  },
  'michael@cubebox.co.il',
  projectName,
  DEP_REGION,
);*/
// await generateSSHKey();
// generateBaseDockerfile({ nodeTag });
/*generateCustomServerDockerfile(
  { nodeTag, customBuildLine: 'RUN npx nx build ' + appNames[0] },
  projectName,
  appNames[0],
  ecrUri,
  4348,
);*/
/*generateStandaloneNextDockerfile(
  {},
  projectName,
  await getEcrUri(),
  appNames[1],
);*/
// stagingENVs.forEach((env) => createECSCluster(env, env === 'prod'));
// apps.forEach(({ name, port }) => createTaskDefinition(name, port));
// createS3Bucket('cubebox-prod', true)
// createS3Bucket('cubebox-preprod')
// apps.forEach(({ domain }) => requestCertificate(domain));

console.log(
  await Promise.all(
    apps.map(
      async ({ name, port }) =>
        await createECSService(
          name,
          'prod',
          'arn:aws:ecs:' +
            DEP_REGION +
            ':' +
            someNum +
            ':task-definition/mik' +
            name +
            ':1',
          port,
          certificateArn,
        ),
    ),
  ),
);
