import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { agiSettings } from '../../config';
import { ChatRequestMessageUnion } from '@azure/openai/types/src/models/models';
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
const endpoint = agiSettings.azureEndpoint;
const apiKey = agiSettings.azureAPIKey;

export const completeWithAzure = async (
  model: string,
  chat: ChatRequestMessageUnion[],
) =>
  new OpenAIClient(endpoint, new AzureKeyCredential(apiKey)).getChatCompletions(
    model,
    chat,
    {},
  );
