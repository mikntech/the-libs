import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Openai = require('openai');

export const completeWithOpenai = async (model: string, chat: any) =>
  new Openai().completions.create({ model, prompt: chat });
