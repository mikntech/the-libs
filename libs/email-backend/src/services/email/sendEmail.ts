import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const sendgrid = require('@sendgrid/mail');

import { getEmailSettings } from '../../config';
import { getExpressSettings } from '@the-libs/express-backend';
import { StagingEnvironment } from '@the-libs/base-shared';

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    sendgrid.setApiKey(getEmailSettings().sendgridApiKey);
    await sendgrid.send({
      to,
      from: getEmailSettings().sendgridSender,
      subject,
      html,
    });
    console.log('Successfully sent email to ' + to);
  } catch (error) {
    console.log('Error sending email:', error);
    getExpressSettings().stagingEnv === StagingEnvironment.Local &&
      console.log('tried to email about ', subject, ': ', html);
  }
};
