import WebPush from 'web-push';
import { TODO } from '@the-libs/base-shared';
import { notificationsSettings } from '../../config';

WebPush.setVapidDetails(
  notificationsSettings.pushSubject,
  notificationsSettings.pushPublicKey,
  notificationsSettings.pushPrivateKey,
);

export const sendPushNotification = async <D extends { domain: string }>(
  subscription: TODO,
  payload: { title: string; body: string },
  data: D,
) => {
  try {
    await WebPush.sendNotification(
      subscription,
      JSON.stringify({ ...payload, ...data }),
    );
    console.log('Notification sent successfully.');
  } catch (error) {
    console.log('Error sending notification:', error);
  }
};
