import { AzureOpenAI } from 'openai';
const apiVersion = '2024-04-01-preview';
import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from '@azure/identity';
import { agiSettings } from '../../config';
const credential = new DefaultAzureCredential();
const scope = 'https://cognitiveservices.azure.com/.default';
const azureADTokenProvider = getBearerTokenProvider(credential, scope);
const options = {
  azureADTokenProvider,
  deployment: agiSettings.azureModel,
  apiVersion,
};

export const completeWithOpenai = async (model: string, chat: any) =>
  new AzureOpenAI(options).completions.create({ model, prompt: chat });
