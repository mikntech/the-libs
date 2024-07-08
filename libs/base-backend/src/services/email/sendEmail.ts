import sendgrid from '@sendgrid/mail';
import { settings } from 'base-backend';


export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    sendgrid.setApiKey(settings.sendgridApiKey);
    await sendgrid.send({
      to,
      from: settings.sendgridSender,
      subject,
      html,
    });
    settings.stagingEnv === 'local' &&
      console.log('Successfully sent email to ' + to);
  } catch (error) {
    settings.stagingEnv !== 'local' &&
      console.log('Error sending email:', error);
  }
};
