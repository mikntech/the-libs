import { SimpleAddress } from '../../';

export const formatTextNicely = (str: string): string =>
  str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const formatAddressNicely = (address: SimpleAddress) =>
  Object.keys(address)
    .filter((name) => name !== '_id')
    .map((key) => (address ? address[key as keyof typeof address] : []))
    .join(', ');

export const printLongText = (text: string) => {
  return text.replace(/\\n/g, '\n'); // Just replace the escaped newlines if needed
};

export const printLongTextNicely = (text: any) =>
  JSON.stringify(text, null, 2).replace(/\\n/g, '\n').replace(/"/g, '');
