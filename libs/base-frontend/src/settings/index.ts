import { removePrefix } from '@the-libs/base-shared';
import * as process from 'node:process';

export type BaseFrontendSettings<NEXT extends boolean> = NEXT extends true
  ? { NEXT_PUBLIC_NODE_ENV: string; NEXT_PUBLIC_STAGING_ENV: string }
  : { VITE_NODE_ENV: string; VITE_STAGING_ENV: string };

type InputWithoutBundlerPrefix = Record<string, any>;

export const getFrontendSettings = <
  NEXT extends boolean,
  INPUT extends BaseFrontendSettings<NEXT>,
>(
  keys: (keyof INPUT)[],
  next: NEXT,
  env: NEXT extends true ? undefined : INPUT,
): InputWithoutBundlerPrefix => {
  const defaultKeys: string[] = next
    ? ['NEXT_PUBLIC_NODE_ENV', 'NEXT_PUBLIC_STAGING_ENV']
    : ['VITE_NODE_ENV', 'VITE_STAGING_ENV'];

  const combinedKeys = [...defaultKeys, ...keys.map(String)]; // Ensure keys are strings

  if (next) {
    const result: InputWithoutBundlerPrefix = {};
    combinedKeys.forEach((key) => {
      result[key] = process.env[key]; // Safely access process.env
    });
    return result;
  }

  let parsedEnv: Record<string, any>;

  try {
    const envConfig =
      document.getElementById('mik-env-config')?.textContent ?? '{}';
    parsedEnv = JSON.parse(envConfig);
  } catch (error) {
    console.error('Error parsing mik-env-config:', error);
    parsedEnv = env ?? {};
  }

  combinedKeys.forEach((key) => {
    if (parsedEnv[key] === undefined) {
      const prefix = next ? 'NEXT_PUBLIC_' : 'VITE_';
      parsedEnv[key] = removePrefix(
        (env as Record<string, any>)[key] || `${prefix}${String(key)}`, // Ensure key is string
        prefix,
      );
    }
  });

  return parsedEnv;
};
