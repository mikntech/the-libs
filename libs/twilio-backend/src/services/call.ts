import { createRequire } from 'module';
import { twilioSettings } from '../config';

const require = createRequire(import.meta.url);
import type { Twilio } from 'twilio';
const twilio = require('twilio');

export const makeCall = async (
  to: string,
  url = 'https://web-3-notifications-8775.twil.io/path_1',
  forSeconds = 22,
  cb = async () => {},
) => {
  const client: Twilio = twilio(
    twilioSettings.clientId,
    twilioSettings.clientSecret,
  );
  return (
    twilioSettings.number &&
    client.calls
      .create({
        from: twilioSettings.number,
        to,
        url,
        timeout: forSeconds,
      })
      .then((call) => {
        console.log(call.sid);
        cb();
      })
      .catch((error) => {
        console.error('Error initiating call:', error);
      })
  );
};
