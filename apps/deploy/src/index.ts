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
} from '@the-libs/cicd-backend';

const DOMAIN = 'cubebox.co.il';
const DEP_REGION = 'il-central-1';
const projectName = 'cb';
const appNames = ['server', 'client'];
const nodeTag = '18.20.4';

// createHostedZone(DOMAIN);
// enableRegion(DEP_REGION);
//createMultipleECRRepositories(projectName, appNames, DEP_REGION);
await getEcrUri(false);
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
generateStandaloneNextDockerfile({}, appNames[1]);
