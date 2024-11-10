export interface BaseFrontendSettings {
  VITE_NODE_ENV: string;
  VITE_STAGING_ENV: string;
}

export const getFrontendSettings = <FES extends BaseFrontendSettings>(
  keys: (keyof FES)[],
): FES => {
  let res;
  try {
    const envConfig = document.getElementById('mik-env-config')?.textContent;
    res = JSON.parse(envConfig ?? '{}');
  } catch (e) {
    res = import.meta.env;
  }
  keys.forEach((key) => {
    if (res[key] === undefined)
      res[key] = import.meta.env[key as keyof ImportMetaEnv];
  });
  return res.map();
};
