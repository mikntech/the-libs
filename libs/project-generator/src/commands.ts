import { execSync } from 'child_process';

export const doCommand = (cmnd: string) =>
  execSync(cmnd, {
    stdio: 'inherit',
  });

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
