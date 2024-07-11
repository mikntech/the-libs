import sendgrid from '@sendgrid/mail';
import { baseSettings } from 'base-backend';

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    sendgrid.setApiKey(baseSettings.sendgridApiKey);
    await sendgrid.send({
      to,
      from: baseSettings.sendgridSender,
      subject,
      html,
    });
    baseSettings.stagingEnv === 'local' &&
      console.log('Successfully sent email to ' + to);
  } catch (error) {
    baseSettings.stagingEnv !== 'local' &&
      console.log('Error sending email:', error);
  }
};
