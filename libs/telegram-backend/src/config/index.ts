import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { config } = require('dotenv');
const process = require('process');

config();

export interface TelegramSettings {
  botToken: string;
  apiBase: string;
  apiUrl: string;
}

const botToken = process.env['TELEGRAM_BOT_TOKEN'] ?? '';
const apiBase =
  process.env['TELEGRAM_API_BASE'] ?? 'https://api.telegram.org/bot';

export const telegramSettings: TelegramSettings = {
  botToken,
  apiBase: process.env['TELEGRAM_API_BASE'] ?? 'https://api.telegram.org/bot',
  apiUrl: `${apiBase}${botToken}`,
};
