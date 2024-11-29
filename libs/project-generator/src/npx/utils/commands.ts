import { execSync } from 'child_process';
import { NXGOptions } from './questions.js';
import { TODO } from '@the-libs/base-shared';

export const nxGen = (option: keyof typeof NXGOptions) =>
  option === 'USE_NPX' ? 'npx nx' : 'nx';

const MAX_RETRIES = 3;

export const doCommand = (cmnd: string, retries = MAX_RETRIES) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return execSync(cmnd, {
        stdio: 'inherit',
      });
    } catch (error: TODO) {
      const errorOutput = error?.stderr?.toString() || error?.message || '';
      if (errorOutput.includes('NX   LOCK_FILES_CHANGED')) {
        console.warn(`Lock file changed. Retrying... (Attempt ${attempt + 1})`);
        try {
          // Attempt to re-install dependencies
          execSync('npm install', { stdio: 'inherit' });
        } catch (installError: TODO) {
          console.error(
            'Failed to resolve lock file issue:',
            installError.message,
          );
          throw error; // Re-throw if dependency installation fails
        }
      } else {
        console.error('Command failed for another reason:', errorOutput);
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
