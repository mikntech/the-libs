import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const { config } = require('dotenv');
const process = require('process');

config();

export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
}

export interface MongoSettings {
  nodeEnv: NodeEnvironment;
  mongoURI: string;
  defaultDebugAllModels: boolean;
}

const validEnvs: NodeEnvironment[] = Object.values(NodeEnvironment);
const nodeEnv = process.env['NODE_ENV'] as NodeEnvironment;
if (!validEnvs.includes(nodeEnv)) {
  throw new Error("NODE_ENV must be 'development' or 'production'");
}

export const isProduction = nodeEnv === NodeEnvironment.Production;

export const mongoSettings: MongoSettings = {
  nodeEnv: isProduction
    ? NodeEnvironment.Production
    : NodeEnvironment.Development,
  mongoURI:
    process.env['MONGO_URI'] ??
    (isProduction ? '' : 'mongodb://127.0.0.1:27017/error'),
  defaultDebugAllModels: Boolean(process.env['MONGO_DEFAULT_DEBUG']),
};
