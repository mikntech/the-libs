import { execSync } from 'child_process';
import { NXGOptions } from './questions.js';

export const nxGen = (option: NXGOptions) =>
  option === NXGOptions.USE_NPX ? 'npx nx' : 'nx';

export const doCommand = (cmnd: string) =>
  execSync(cmnd, {
    stdio: 'inherit',
  });

export const doCommandInD = (d: string, cmnd: string) =>
  execSync('cd ' + d + ' && ' + cmnd, {
    stdio: 'inherit',
  });

export const log = (text: string) => doCommand('echo ' + text);

export const createAFile = (
  name: string,
  content: string,
  path: string = './',
) =>
  doCommand(
    'cd ' +
      path +
      ' && ' +
      'cat <<EOF >> ./' +
      name +
      `
  ${content}`,
  );
