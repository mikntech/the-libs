import { removePrefix } from '@the-libs/base-shared';

export const getViteSettings = (
  keys: string[],
  env: Record<string, string>,
): Record<string, string> => {
  const result: Record<string, string> = {};

  keys.forEach((key) => {
    result[key] = removePrefix(env[key] ?? '', 'VITE_');
  });

  return result;
};
