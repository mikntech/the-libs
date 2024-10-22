#!/usr/bin/env node

import { gitignoreTemplate } from './templates/gitignore';
import { indexTsTemplate } from './templates/indexTs';
import { projectJsonTemplate } from './templates/projectJson';
import { tsconfigAppJsonTemplate } from './templates/tsconfigAppJson';
import { tsconfigBaseJsonTemplate } from './templates/tsconfigBaseJson';
import { tsconfigJsonTemplate } from './templates/tsconfigJson';
import { askForAppsAndLibs, askQuestions } from './questions';
import { createAFile, doCommand } from './commands';

async function createProject() {
  const { name } = await askQuestions();
  doCommand('sudo npm i -g nx');
  doCommand(`npx --yes create-nx-workspace@latest ${name} \\
  --preset=ts \\
  --nxCloud=skip \\
  --packageManager=npm \\
  --interactive=false \\
  --skipGit=false \\
  --npmScope=${name}`);
  doCommand(`rm -rf ./${name}/packages`);
  doCommand(`rm -rf ./${name}/README.md`);
  doCommand(`rm -rf ./${name}/.gitignore`);
  createAFile('.gitignore', gitignoreTemplate, name);
  const libsToInstall = await askForAppsAndLibs();
  doCommand(
    `cd ${name} && npm i ${libsToInstall.map((x: string) => '@the-libs/' + x).join(' ')}`,
  );
  doCommand(`cd ${name} && mkdir apps`);
  doCommand(`cd ${name} && npm i -D @nx/esbuild`);
  doCommand(`cd ${name} && npm i -D esbuild`);
  doCommand(`cd ${name} && rm -f ./tsconfig.base.json`);
  createAFile('tsconfig.base.json', tsconfigBaseJsonTemplate, './' + name);
  const appNames = ['example'];
  appNames.forEach((appName) => {
    doCommand(`cd ${name}/apps && mkdir ${appName}`);
    doCommand(`cd ${name}/apps/${appName} && mkdir src`);
    createAFile(
      'project.json',
      projectJsonTemplate(appName),
      './' + name + '/apps/' + appName,
    );
    createAFile(
      'tsconfig.json',
      tsconfigJsonTemplate,
      './' + name + '/apps/' + appName,
    );
    createAFile(
      'tsconfig.app.json',
      tsconfigAppJsonTemplate,
      './' + name + '/apps/' + appName,
    );
    createAFile(
      'index.ts',
      indexTsTemplate,
      './' + name + '/apps/' + appName + '/src',
    );
    doCommand(`cd ${name} && nx build ` + appName);
    doCommand(`cd ${name} && nx serve ` + appName);
  });

  ///

  doCommand(`cd ${name} && git add .`);
}

createProject();
