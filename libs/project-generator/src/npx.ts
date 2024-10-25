#!/usr/bin/env node

import { gitignoreTemplate } from './templates/gitignore.js';
import { indexTsTemplate } from './templates/indexTs.js';
import { projectJsonTemplate } from './templates/projectJson.js';
import { tsconfigAppJsonTemplate } from './templates/tsconfigAppJson.js';
import { tsconfigBaseJsonTemplate } from './templates/tsconfigBaseJson.js';
import { tsconfigJsonTemplate } from './templates/tsconfigJson.js';
import { askQuestions, NXGOptions } from './questions.js';
import {
  createAFile,
  doCommand,
  doCommandInD,
  log,
  nxGen,
} from './commands.js';
import { AppType } from './types.js';

const createApp = async (
  pname: string,
  nx: string,
  type: AppType,
  appName: string,
) => {
  switch (type) {
    case AppType.Server:
      doCommandInD(`${pname}/apps`, `mkdir ${appName}`);
      doCommandInD(`${pname}/apps/${appName}`, `mkdir src`);
      createAFile(
        'project.json',
        projectJsonTemplate(appName),
        './' + pname + '/apps/' + appName,
      );
      createAFile(
        'tsconfig.json',
        tsconfigJsonTemplate,
        './' + pname + '/apps/' + appName,
      );
      createAFile(
        'tsconfig.app.json',
        tsconfigAppJsonTemplate,
        './' + pname + '/apps/' + appName,
      );
      createAFile(
        'index.ts',
        indexTsTemplate,
        './' + pname + '/apps/' + appName + '/src',
      );
      break;
    case AppType.Client:
      // need to ideate
      break;
    case AppType.Next:
      doCommandInD(
        pname,
        `${nx} g @nx/next:app apps/${appName} --style=scss --e2eTestRunner=none --appRouter=true --srcDir=true`,
      );
      doCommandInD(`${pname}+/apps/${appName}`, 'rm -rf public/.gitkeep');
      doCommandInD(`${pname}+/apps/${appName}`, 'rm -rf specs');
      doCommandInD(`${pname}+/apps/${appName}`, 'rm -rf jest.config.ts');
      doCommandInD(`${pname}+/apps/${appName}`, 'rm -rf src/app/api');
      doCommandInD(`${pname}+/apps/${appName}`, 'rm -rf tsconfig.spec.json');
      doCommandInD(pname, 'rm -rf ./jest.config.ts');
      doCommandInD(pname, 'rm -rf ./jest.preset.ts');

      break;
  }
};

const createProject = async () => {
  const { name, nxg, libsToInstall, servers, clients, nextjss } =
    await askQuestions();
  const nx = nxGen(nxg);
  nxg === NXGOptions.SUDO_INSTALL_GLOBAL && doCommand('sudo npm i -g nx');
  doCommand(`npx --yes create-nx-workspace@latest ${name} \\
  --preset=ts \\
  --nxCloud=skip \\
  --packageManager=npm \\
  --interactive=false \\
  --skipGit=false \\
  --npmScope=${name}`);
  doCommandInD(`${name}`, `rm -rf packages`);
  doCommandInD(`${name}`, `rm -rf README.md`);
  doCommandInD(`${name}`, `rm -rf .gitignore`);
  createAFile('.gitignore', gitignoreTemplate, name);
  doCommandInD(
    name,
    `npm i ${libsToInstall.map((x: string) => '@the-libs/' + x).join(' ')}`,
  );
  doCommandInD(name, `mkdir apps`);
  doCommandInD(name, `npm i -D @nx/esbuild`);
  doCommandInD(name, `npm i -D esbuild`);
  doCommandInD(name, `rm -f ./tsconfig.base.json`);
  createAFile('tsconfig.base.json', tsconfigBaseJsonTemplate, './' + name);
  log('doing servers');
  await Promise.all(
    servers.map(
      async (appName: string) =>
        await createApp(name, nx, AppType.Server, appName),
    ),
  );
  log('doing clients');
  await Promise.all(
    clients.map(
      async (appName: string) =>
        await createApp(name, nx, AppType.Client, appName),
    ),
  );
  log('doing next if needed');
  nextjss.length > 0 && doCommand('cd ' + name + ' && ' + nx + ' add @nx/next');
  log('doing nexts');
  await Promise.all(
    nextjss.map(
      async (appName: string) =>
        await createApp(name, nx, AppType.Next, appName),
    ),
  );

  /// cicd?

  doCommandInD(name, `git add .`);
};

createProject();
