import { Address, TODO } from '../types';

export const format = (str: string): string =>
  str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const formatAddress = (address: Address) =>
  Object.keys(address)
    .filter((name) => name !== '_id')
    .map((key) => (address ? address[key as keyof typeof address] : []))
    .join(', ');

const looksLikeDate = (str: string): boolean => {
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
      ? looksLikeDate(item) &&
        !isNaN(Date.parse(item)) &&
        new Date(item).getFullYear() !== 2001
        ? new Date(item).toString()
        : format(item)
      : item instanceof Date
        ? item.toLocaleDateString()
        : typeof item === 'object' && item !== null
          ? JSON.stringify(item)
          : format(String(item));
