export * from './format-text';

import { TODO } from '../types';
import { formatTextNicely } from './format-text';

export const parseJSONWithType = <I>(theString: string & { __type__: I }) =>
  JSON.parse(theString) as I;

const doesLooksLikeDate = (str: string): boolean => {
  // Regular expression to match common date formats (e.g., YYYY-MM-DD, MM/DD/YYYY)
  const datePattern = /^(?:\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})$/;
  return datePattern.test(str);
};

export const guessValueType = (item: TODO) =>
  typeof item === 'boolean' || item === undefined
    ? item
      ? 'Yes'
      : 'No'
    : typeof item === 'string'
      ? doesLooksLikeDate(item) &&
        !isNaN(Date.parse(item)) &&
        new Date(item).getFullYear() !== 2001
        ? new Date(item).toString()
        : formatTextNicely(item)
      : item instanceof Date
        ? item.toLocaleDateString()
        : typeof item === 'object' && item !== null
          ? JSON.stringify(item)
          : formatTextNicely(String(item));

export const handleSubscribeClick = (
  pubkey: string,
  cb: (pushSubscription: TODO) => void,
) => {
  navigator.serviceWorker.ready.then((registration) => {
    const padding = '='.repeat((4 - (pubkey?.length % 4)) % 4);
    const base64 = (pubkey + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData?.length);
    for (let i = 0; i < rawData?.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: outputArray,
      })
      .then((pushSubscription) => cb(pushSubscription))
      .catch((error) => {
        console.log('Error during getSubscription()', error);
      });
  });
};

export const stringifyIfNeeded = (o: TODO) => {
  try {
    return String(o) === '[object Object]' ? JSON.stringify(o) : o;
  } catch {
    return 'stringification is needed but not possible';
  }
};
