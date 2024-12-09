import { removePrefix } from '@the-libs/base-shared';

export type BaseFrontendSettings<NEXT extends boolean> = NEXT extends true
  ? { NEXT_PUBLIC_NODE_ENV: string; NEXT_PUBLIC_STAGING_ENV: string }
  : {
      VITE_NODE_ENV: string;
      VITE_STAGING_ENV: string;
    };

type InputWithoutBundlerPrefix = any;
export const getFrontendSettings = <
  NEXT extends boolean,
  INPUT extends BaseFrontendSettings<NEXT>,
>(
  keys: (keyof INPUT)[],
  next: NEXT,
): InputWithoutBundlerPrefix => {
  if (next) return process.env;
  let res;
  try {
    const envConfig = document.getElementById('mik-env-config')?.textContent;
    res = JSON.parse(envConfig ?? '{}');
  } catch (e) {
    res = import.meta.env;
  }
  [
    ...(next
      ? ['NEXT_PUBLIC_NODE_ENV', 'NEXT_PUBLIC_STAGING_ENV']
      : ['VITE_NODE_ENV', 'VITE_STAGING_ENV']),
    ...keys,
  ].forEach((key) => {
    if (res[key] === undefined)
      res[key] = removePrefix(
        import.meta.env[key as keyof ImportMetaEnv],
        next ? 'NEXT_PUBLIC_' : 'VITE_',
      );
  });
  return res;
};
