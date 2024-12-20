import { createRequire } from 'module';
import { twilioSettings } from '../config';

const require = createRequire(import.meta.url);
import type { Twilio } from 'twilio';
const twilio = require('twilio');

export const sendSMS = async (
  to: string,
  body: string,
  cb = async () => {},
) => {
  const client: Twilio = twilio(
    twilioSettings.clientId,
    twilioSettings.clientSecret,
  );
  return client.messages
    .create({
      from: twilioSettings.sms_service,
      to,
      body,
    })
    .then((message) => {
      console.log(message.sid);
      cb();
    });
};
