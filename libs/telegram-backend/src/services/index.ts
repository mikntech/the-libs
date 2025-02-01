import axios from 'axios';
import { telegramSettings } from '../config';
import { TODO } from '@the-libs/base-shared';

export const sendTelegramMessage = async (chatId: string, text: string) => {
  try {
    await axios.post(`${telegramSettings.apiUrl}/sendMessage`, {
      chat_id: chatId,
      text: text,
    });
  } catch (error: TODO) {
    console.error(
      'Error sending telegram message:',
      error.response ? error.response.data : error.message,
    );
  }
};
