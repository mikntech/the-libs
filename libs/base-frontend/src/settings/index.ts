import { removePrefix } from '@the-libs/base-shared';
import * as process from 'node:process';

export type BaseFrontendSettings<NEXT extends boolean> = NEXT extends true
  ? { NEXT_PUBLIC_NODE_ENV: string; NEXT_PUBLIC_STAGING_ENV: string }
  : { VITE_NODE_ENV: string; VITE_STAGING_ENV: string };

export type InputWithoutBundlerPrefix<INPUT> = {
  [K in keyof INPUT]: string;
} & { STAGING_ENV: string }; // Explicitly include required STAGING_ENV

export const getFrontendSettings = <
  NEXT extends boolean,
  INPUT extends BaseFrontendSettings<NEXT> & Record<string, string>,
>(
  keys: (keyof INPUT)[],
  next: NEXT,
  env: NEXT extends true ? undefined : INPUT,
): InputWithoutBundlerPrefix<INPUT> => {
  const defaultKeys = next
    ? (['NEXT_PUBLIC_NODE_ENV', 'NEXT_PUBLIC_STAGING_ENV'] as const)
    : (['VITE_NODE_ENV', 'VITE_STAGING_ENV'] as const);

  const combinedKeys = [...defaultKeys, ...keys] as (keyof INPUT)[];

  const result: Partial<InputWithoutBundlerPrefix<INPUT>> = {};

  if (next) {
    combinedKeys.forEach((key) => {
      const value = process.env[key as string]; // Safely access process.env
      result[key] = removePrefix(
        value ?? '',
        'NEXT_PUBLIC_',
      ) as InputWithoutBundlerPrefix<INPUT>[keyof INPUT];
    });
  } else {
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
      if (parsedEnv[key as string] === undefined) {
        const prefix = next ? 'NEXT_PUBLIC_' : 'VITE_';
        parsedEnv[key as string] = removePrefix(
          (env as Record<string, any>)[key as string] ??
            `${prefix}${String(key)}`,
          prefix,
        );
      }
      result[key] = parsedEnv[key as string];
    });
  }

  // Ensure STAGING_ENV is included in the result
  if (!result.STAGING_ENV) {
    result.STAGING_ENV =
      result.NEXT_PUBLIC_STAGING_ENV ??
      result.VITE_STAGING_ENV ??
      'default-staging';
  }

  // Ensure all keys in combinedKeys are included in the result
  combinedKeys.forEach((key) => {
    if (!result[key]) {
      throw new Error(`Missing key: ${String(key)} in frontend settings`);
    }
  });

  return result as InputWithoutBundlerPrefix<INPUT>;
};
