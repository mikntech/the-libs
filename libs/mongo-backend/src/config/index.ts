import { createRequire } from 'module';
import { getExpressSettings, NodeEnvironment } from '@the-libs/express-backend';

const require = createRequire(import.meta.url);

const { config } = require('dotenv');
const process = require('process');

config();

export interface MongoSettings {
  mongoURI: string;
}

export const mongoSettings: MongoSettings = {
  mongoURI:
    process.env['MONGO_URI'] ??
    (getExpressSettings().nodeEnv === NodeEnvironment.Production
      ? ''
      : 'mongodb://localhost:27017/error'),
};
