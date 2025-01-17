import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const sendgrid = require('@sendgrid/mail');

import { getEmailSettings } from '../../config';
import { StagingEnvironment } from '@the-libs/base-shared';
import { mongoSettings } from '@the-libs/mongo-backend';

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
    console.log('' + 'Error sending email:', error);
    mongoSettings.stagingEnv === StagingEnvironment.Local &&
      console.log('tried to email about ', subject, ': ', html);
  }
};
