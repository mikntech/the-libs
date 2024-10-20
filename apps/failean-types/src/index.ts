import { WhiteModels } from './white-models/index';

export type PromptPartType = 'static' | 'variable';

export interface PromptPart {
  type: PromptPartType;
  content: string;
}

export interface ChatCompletion {
  role: keyof RoleMap;
  prompt: PromptPart[];
}
export type PromptMap = Record<string, ChatCompletion>;

export type PromptName = keyof PromptMap;

export interface PromptWireframe {
  name: PromptName;
  deps: PromptName[];
  level: number;
}

export type PromptWireframeGraph = PromptWireframe[];

export type PromptGraph = Prompt[];

export interface Prompt extends PromptWireframe {
  result: WhiteModels.Data.Prompts.WhitePromptResult | 'empty' | 'idea';
}

export interface GroupedPrompt {
  groupName: string;
  prompt: ChatCompletion;
  level: number;
}

export type RoleMap = Record<string, string>;

export interface FormData {
  marketValidation: string;
  userFeedback: string;
  financialResources: string;
  technicalResources: string;
  partnership: string;
  productOrService: string;
}

export interface OpenAIJob {
  taskID: string;
  ideaID: string;
  promptName: PromptName;
  feedback?: string;
  reqUUID: string;
  id?: number;
}

export * from './api/index';
export * from './white-models/index';
export * from './oc-models/index';
