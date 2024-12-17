import { agiSettings } from '../../config';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { AzureOpenAI } = require('openai');
import type { AzureOpenAI as OpenAI, AzureClientOptions } from 'openai';
/*import {
  ChatCompletionCreateParams,
  ChatCompletionCreateParamsBase,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming,
} from 'openai/src/resources/chat/completions';
import * as Core from 'openai/src/core';*/
import { TODO } from '@the-libs/base-shared';

const apiVersion = '2024-07-01-preview';

/*

type Params = {
  [0]:
    | ChatCompletionCreateParamsNonStreaming
    | ChatCompletionCreateParamsStreaming
    | ChatCompletionCreateParamsBase
    | ChatCompletionCreateParams;
  [1]?: Core.RequestOptions;
};
*/

export const complete = async ({
  modelConfig,
  params,
}: {
  modelConfig?: AzureClientOptions;
  params: /*Params*/ TODO;
}) => {
  const defaultModelConfig = {
    apiKey: agiSettings.azureAPIKey,
    deployment: agiSettings.azureModel,
    apiVersion,
    endpoint: agiSettings.azureEndpoint,
  };
  const azureOpenAIInstance: OpenAI = new AzureOpenAI({
    ...defaultModelConfig,
    ...(modelConfig ?? {}),
  } as TODO);
  try {
    return azureOpenAIInstance.chat.completions.create(
      params[0] as TODO,
      params[1] as TODO,
    );
  } catch (error) {}
  return null;
};
