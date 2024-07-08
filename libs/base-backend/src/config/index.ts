import { config } from 'dotenv';

config();

export enum NodeEnvironment {
  'development' = 'development',
  'production' = 'production',
}
export enum StagingEnvironment {
  'local' = 'local',
  'dev' = 'dev',
  'preprod' = 'preprod',
  'prod' = 'prod',
}

interface AWSConfig {
  keyID: string;
  secretKey: string;
  region: string;
}

interface Settings {
  nodeEnv: NodeEnvironment;
  stagingEnv: StagingEnvironment;
  port: number;
  mongoURI: string;
  jwtSecret: string;
  clientDomain: string;
  myDomain: string;
  aws: AWSConfig;
  sendgridApiKey: string;
  sendgridSender: string;
}

const validEnvs: NodeEnvironment[] = Object.values(NodeEnvironment);
const validStagingEnvs: StagingEnvironment[] =
  Object.values(StagingEnvironment);

if (!validEnvs.includes(process.env['NODE_ENV'] as NodeEnvironment)) {
  throw new Error("NODE_ENV must be 'development' or 'production'");
}

if (
  !validStagingEnvs.includes(process.env['STAGING_ENV'] as StagingEnvironment)
) {
  throw new Error("STAGING_ENV must be 'local', 'dev', 'preprod', or 'prod'");
}

const isProduction = process.env['NODE_ENV'] === 'production';
const defaultStagingEnv = isProduction ? 'prod' : 'local';

const port = parseInt(process.env['PORT'] ?? '4050');
const stagingEnv =
  (process.env['STAGING_ENV'] as StagingEnvironment) || defaultStagingEnv;

const prodDomain='https://' + stagingEnv === StagingEnvironment.prod
  ? ''
  : stagingEnv + process.env['CLIENT_DOMAIN']

const clientDomain = isProduction
  ? prodDomain
  : 'http://localhost:' + port;

export const settings: Settings = {
  nodeEnv: isProduction
    ? NodeEnvironment.production
    : NodeEnvironment.development,
  stagingEnv,
  port,
  mongoURI:
    process.env['MONGO_URI'] ??
    (isProduction ? '' : 'mongodb://localhost:27017/error'),
  jwtSecret: process.env['JWT_SECRET'] ?? "",
  myDomain: process.env['MY_DOMAIN'] ?? '0.0.0.0',
  aws: {
    keyID: process.env['AWS_KEY_ID'] ?? '',
    secretKey: process.env['AWS_SECRET_KEY'] ?? '',
    region: process.env['AWS_REGION'] ?? '',
  },
  clientDomain,
  sendgridApiKey: process.env['SENDGRID_API_KEY'] ?? '',
  sendgridSender: process.env['SENDGRID_SENDER'] ?? 'service@' + clientDomain,
};

if (!settings) {
  throw new Error('Configuration settings could not be loaded');
} else console.log('settings: ', JSON.stringify(settings));

