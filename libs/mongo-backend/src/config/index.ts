import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { config } = require('dotenv');
const process = require('process');

config();

export interface MongoSettings {
  mongoURI: string;
}

export const mongoSettings: MongoSettings = {
  mongoURI: process.env['MONGO_URI'] ?? 'mongodb://localhost:27017/error',
};
