import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const sendgrid = require('@sendgrid/mail');

import { getEmailSettings } from '../../config';
import {
  getExpressSettings,
  StagingEnvironment,
} from '@the-libs/express-backend';

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    sendgrid.setApiKey(getEmailSettings().sendgridApiKey);
    await sendgrid.send({
      to,
      from: getEmailSettings().sendgridSender,
      subject,
      html,
    });
    
  } catch (error) {
    
    getExpressSettings().stagingEnv === StagingEnvironment.Local &&
      
  }
};
