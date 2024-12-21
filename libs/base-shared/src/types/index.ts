export * from './db/mongo/schemas';

export type TODO = any;

export type SomeEnum<enumValues> = { [P in keyof enumValues]: string };

export interface SimpleAddress {
  street?: string;
  city?: string;
  country?: string;
}

export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
}

export enum StagingEnvironment {
  Local = 'local',
  Dev = 'dev',
  Preprod = 'pre',
  Prod = 'prod',
}
