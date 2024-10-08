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

export const stringifyIfNeeded = (o: TODO) => {
  try {
    return String(o) === '[object Object]' ? JSON.stringify(o) : o;
  } catch {
    return 'stringification is needed but not possible';
  }
};
