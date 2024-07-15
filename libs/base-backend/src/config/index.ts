import { config } from 'dotenv';
import * as process from 'node:process';

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

export interface BaseSettings<CD> {
  nodeEnv: NodeEnvironment;
  stagingEnv: StagingEnvironment;
  port: number;
  mongoURI: string;
  clientDomains: CD;
  myDomain: string;
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
  throw new Error(
    'STAGING_ENV must be one of these: ' + Object.values(StagingEnvironment),
  );
}

const isProduction = process.env['NODE_ENV'] === 'production';
const defaultStagingEnv = isProduction
  ? StagingEnvironment.prod
  : StagingEnvironment.local;

const port = parseInt(process.env['PORT'] ?? '4050');
const stagingEnv =
  (process.env['STAGING_ENV'] as StagingEnvironment) || defaultStagingEnv;

const generateFullDomain = (base: string, port: string) => {
  const prodDomain =
    'https://' + stagingEnv === StagingEnvironment.prod
      ? ''
      : stagingEnv + base;
  return isProduction ? prodDomain : 'http://localhost:' + port;
};

const myDomain = generateFullDomain(
  process.env['MY_DOMAIN'] ?? 'localhost',
  String(port),
);

export const getBaseSettings = <
  CB extends { [key: string]: string } = { single: string },
>(): BaseSettings<CB> => {
  const clientDomains: CB = JSON.parse(
    process.env['CLIENT_DOMAINS'] ?? JSON.stringify({ single: 'my.co' }),
  );

  Object.keys(clientDomains).forEach((key) => {
    (clientDomains as { [key: string]: string })[key] = generateFullDomain(
      clientDomains[key],
      String(process.env['CLIENT_PORT'] ?? 4100),
    );
  });

  return {
    nodeEnv: isProduction
      ? NodeEnvironment.production
      : NodeEnvironment.development,
    stagingEnv,
    port,
    mongoURI:
      process.env['MONGO_URI'] ??
      (isProduction ? '' : 'mongodb://localhost:27017/error'),
    myDomain,
    clientDomains,
  };
};

export const validateSettings = <CB>(settings: BaseSettings<CB>) => {
  if (!settings) {
    throw new Error('Configuration settings could not be loaded');
  } else console.log('settings: ', JSON.stringify(settings));
};
