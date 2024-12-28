export const parseProdViteEnv = () => {
  try {
    return JSON.parse(
      document?.getElementById?.('mik-env-config')?.textContent ?? '{}',
    );
  } catch {
    return {};
  }
};
