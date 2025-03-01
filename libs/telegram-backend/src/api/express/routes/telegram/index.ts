import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import { sendTelegramMessage } from '../../../../services';
import {
  AuthenticatedRequest,
  highOrderHandler,
} from '@the-libs/express-backend';
import { dontAuth } from '@the-libs/auth-backend';

export const telegramRouter = Router();
telegramRouter.use(dontAuth);

telegramRouter.post(
  '/webhook',
  highOrderHandler(async (req: AuthenticatedRequest) => {
    const { message } = req.body;
    if (!message?.chat || !message.text) {
      return { statusCode: 200, body: 'no message chat or text' };
    }

    const chatId = message?.chat?.id;
    const userMessage = message?.text;

    // Check if the bot is mentioned in a group
    if (
      message?.chat?.type?.includes?.('group') &&
      userMessage?.includes?.('@YourBotUsername')
    ) {
      await sendTelegramMessage(
        chatId,
        "Hello! I'm here to help you with couples therapy.",
      );
    }

    return { statusCode: 200, body: 'finished try send message' };
  }),
);
