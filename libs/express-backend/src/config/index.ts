import { createRequire } from 'module';
import { isProduction } from '@the-libs/mongo-backend';
const require = createRequire(import.meta.url);
const { config } = require('dotenv');
const process = require('process');
config();

export enum StagingEnvironment {
  Local = 'local',
  Dev = 'dev',
  Preprod = 'pre',
  Prod = 'prod',
}

export interface ExpressSettings<CD> {
  stagingEnv: StagingEnvironment;
  port: number;
  clientDomains: CD;
  myDomain: string;
}

const validStagingEnvs: StagingEnvironment[] =
  Object.values(StagingEnvironment);

const stagingEnv = process.env['STAGING_ENV'] as StagingEnvironment;
if (!validStagingEnvs.includes(stagingEnv)) {
  throw new Error(
    `STAGING_ENV must be one of: ${Object.values(StagingEnvironment).join(', ')}`,
  );
}

const defaultStagingEnv = isProduction
  ? StagingEnvironment.Prod
  : StagingEnvironment.Local;

const port = parseInt(process.env['PORT'] ?? '4050');
const currentStagingEnv = stagingEnv || defaultStagingEnv;

const generateFullDomain = (base: string, port: string) => {
  return isProduction
    ? `https://${currentStagingEnv === StagingEnvironment.Prod ? '' : currentStagingEnv}${base}`
    : `http://localhost:${port}`;
};

const myDomain = generateFullDomain(
  process.env['MY_DOMAIN'] ?? 'localhost',
  String(port),
);

export const getExpressSettings = <
  CB extends { [key: string]: string } = { 0: string },
>(): ExpressSettings<CB> => {
  let clientDomains: CB = JSON.parse(
    isProduction
      ? (process.env['CLIENT_DOMAINS'] ?? JSON.stringify({ single: 'my.co' }))
      : (process.env['CLIENT_PORTS'] ?? JSON.stringify({ single: 4000 })),
  );

  if (!isProduction) {
    const mutableClientDomains = JSON.parse(JSON.stringify(clientDomains)) as {
      [key: string]: string;
    };

    Object.keys(mutableClientDomains).forEach((key) => {
      mutableClientDomains[key] =
        'http://localhost:' + mutableClientDomains[key];
    });

    clientDomains = mutableClientDomains as CB;
  }
  return {
    stagingEnv: currentStagingEnv,
    port,
    myDomain,
    clientDomains: clientDomains,
  };
};

// TODO: Can create a settings lib
export const validateSettings = <CB>(settings: ExpressSettings<CB>) => {
  if (!settings) {
    throw new Error('Configuration settings could not be loaded');
  } else {
    console.log('settings:', JSON.stringify(settings));
  }
};
