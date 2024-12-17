import { execSync } from 'child_process';
import { NXGOptions } from './questions.js';

export const nxGen = (option: keyof typeof NXGOptions) =>
  option === 'USE_NPX' ? 'npx nx' : 'nx';

const MAX_RETRIES = 3;

export const doCommand = (cmnd: string, retries = MAX_RETRIES) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return execSync(cmnd, {
        stdio: 'inherit',
      });
    } catch (error: any) {
      const errorOutput = error?.stderr?.toString() || error?.message || '';
      if (errorOutput.includes('NX   LOCK_FILES_CHANGED')) {
        try {
          execSync('npm install', { stdio: 'inherit' }); // Or yarn install
        } catch (installError: any) {
          throw error; // Re-throw if retry fails
        }
      } else if (errorOutput.includes('NX   Failed to process project graph')) {
        execSync('nx reset', { stdio: 'inherit' });
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Command failed after ${retries} retries: ${cmnd}`);
};

export const doCommandInD = (
  d: string,
  cmnd: string,
  retries = MAX_RETRIES,
) => {
  return doCommand(`cd ${d} && ${cmnd}`, retries);
};

export const log = (text: string) => doCommand('echo ' + text);
