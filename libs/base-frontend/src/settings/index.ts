import { removePrefix } from '@the-libs/base-shared';

export const getViteSettings = (
  keys: string[],
  env: Record<string, string>,
): Record<string, string> => {
  const defaultKeys = ['VITE_NODE_ENV', 'VITE_STAGING_ENV'];
  const combinedKeys = [...defaultKeys, ...keys];

  let parsedEnv: Record<string, string> = {};

  try {
    const envConfig =
      document.getElementById('mik-env-config')?.textContent || '{}';
    parsedEnv = JSON.parse(envConfig);
  } catch (error) {
    console.error('Error parsing mik-env-config:', error);
    parsedEnv = env;
  }

  const result: Record<string, string> = {};

  combinedKeys.forEach((key) => {
    result[key] = removePrefix(parsedEnv[key] ?? env[key] ?? '', 'VITE_');
  });

  return result;
};
