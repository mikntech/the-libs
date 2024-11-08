import { agiSettings } from '../../config';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { AzureOpenAI } = require('openai');

const apiVersion = '2024-07-01-preview';

const options = {
  apiKey: agiSettings.azureAPIKey,
  deployment: agiSettings.azureModel,
  apiVersion,
  endpoint: agiSettings.azureEndpoint,
};

const azureOpenAIInstance = new AzureOpenAI(options);

type CreateOptionsType = Parameters<
  typeof azureOpenAIInstance.chat.completions.create
>[0];

export const complete = async (createOptions: CreateOptionsType) => {
  try {
    return new AzureOpenAI(options).chat.completions.create(createOptions);
  } catch (error) {
    console.error('Error with chat completion request:', error);
    throw error;
  }
};
