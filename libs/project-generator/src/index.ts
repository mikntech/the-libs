#!/usr/bin/env node

import { gitignoreTemplate } from './templates/gitignore.js';
import { indexTsTemplate } from './templates/indexTs.js';
import { projectJsonTemplate } from './templates/projectJson.js';
import { tsconfigAppJsonTemplate } from './templates/tsconfigAppJson.js';
import { tsconfigBaseJsonTemplate } from './templates/tsconfigBaseJson.js';
import { tsconfigJsonTemplate } from './templates/tsconfigJson.js';
import { askQuestions } from './questions.js';
import { createAFile, doCommand } from './commands.js';

async function createProject() {
  const { name, libsToInstall } = await askQuestions();
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
