import { removePrefix } from '@the-libs/base-shared';
import * as process from 'node:process';

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
  env: NEXT extends true ? undefined : INPUT,
): InputWithoutBundlerPrefix => {
  const ks = [
    ...(next
      ? ['NEXT_PUBLIC_NODE_ENV', 'NEXT_PUBLIC_STAGING_ENV']
      : ['VITE_NODE_ENV', 'VITE_STAGING_ENV']),
    ...keys,
  ];
  if (next) {
    const ret: any = {};
    ks.forEach((key) => {
      ret[key] = process.env[key];
    });
    return ret as InputWithoutBundlerPrefix;
  }
  let res;
  try {
    const envConfig = document.getElementById('mik-env-config')?.textContent;
    res = JSON.parse(envConfig ?? '{}');
  } catch (e) {
    res = env ?? {};
  }
  ks.forEach((key) => {
    if (res[key] === undefined)
      res[key] = removePrefix(
        (env as any)[key] ?? (next ? 'NEXT_PUBLIC_' : 'VITE_'),
        next ? 'NEXT_PUBLIC_' : 'VITE_',
      );
  });
  return res;
};
