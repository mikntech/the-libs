import {
  createECRRepository,
  createHostedZone,
  createMultipleECRRepositories,
  enableRegion,
} from '@the-libs/cicd-backend';

const DOMAIN = 'cubebox.co.il';
const DEP_REGION = 'il-central-1';
const projectName = 'cb';
const appNames = ['server', 'client'];

// createHostedZone(DOMAIN);
// enableRegion(DEP_REGION);
// createMultipleECRRepositories(projectName, appNames, DEP_REGION);
