export interface BaseFrontendSettings {
  VITE_NODE_ENV: string;
  VITE_WHITE_ENV: string;
}

export const getFrontendSettings = <
  FES extends BaseFrontendSettings,
>(): FES => {
  let res;
  try {
    const envConfig = document.getElementById('mik-env-config')?.textContent;
    res = JSON.parse(envConfig ?? '{}');
  } catch (e) {
    res = import.meta.env;
  }
  return res;
};
