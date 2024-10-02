import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { config } = require('dotenv');
const process = require('process');

config();

export interface AGISettings {
  azureEndpoint: string;
  azureAPIKey: string;
  azureModel: string;
  roi: number;
}

export const agiSettings: AGISettings = {
  azureEndpoint: process.env['OPEN_AI_ENDPOINT'] ?? '',
  azureAPIKey: process.env['OPEN_AI_API_KEY'] ?? '',
  azureModel: process.env['OPEN_AI_MODEL'] ?? '',
  roi: parseFloat(process.env['AGI_ROI'] ?? '2'),
};
