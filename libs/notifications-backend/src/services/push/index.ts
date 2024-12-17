import { TODO } from '@the-libs/base-shared';
import { notificationsSettings } from '../../config';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const WebPush = require('web-push');

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
  } catch (error) {}
};
