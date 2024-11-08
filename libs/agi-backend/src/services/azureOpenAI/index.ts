import { agiSettings } from '../../config';
import { createRequire } from 'module';
import * as ChatAPI from 'openai/src/resources/chat/chat';
import { ChatCompletionMessageParam } from 'openai/src/resources/chat/completions';

const require = createRequire(import.meta.url);
const { AzureOpenAI } = require('openai');
import type { ChatCompletion, APIPromise } from 'openai';

const apiVersion = '2024-07-01-preview';

const options = {
  apiKey: agiSettings.azureAPIKey,
  deployment: agiSettings.azureModel,
  apiVersion,
  endpoint: agiSettings.azureEndpoint,
};

// Chat completion function compatible with GPT-4o
export const complete = async (
  model: (string & {}) | ChatAPI.ChatModel,
  chat: Array<ChatCompletionMessageParam>,
) => {
  try {
    // Format the chat input as a message array expected by chat-completion models
    const messages = [
      { role: 'system', content: 'You are an AI assistant.' },
      { role: 'user', content: chat },
    ];

    // Call chat-completion API instead of completion
    const response: APIPromise<ChatCompletion> = await new AzureOpenAI(
      options,
    ).chat.completions.create({
      model,
      messages,
    });
    return response;
  } catch (error) {
    console.error('Error with chat completion request:', error);
    throw error;
  }
};
