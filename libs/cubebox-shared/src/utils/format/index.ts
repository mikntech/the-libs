import { Address } from '@cubebox-shared';

const formatStr = (str: string): string =>
  str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatAddress = (address: Address) =>
  Object.keys(address)
    .filter((name) => name !== '_id')
    .map((key) => (address ? address[key as keyof typeof address] : []))
    .join(', ');

export default {
  string: formatStr,
  address: formatAddress,
};
