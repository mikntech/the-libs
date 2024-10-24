#!/usr/bin/env node

import { gitignoreTemplate } from './templates/gitignore.js';
import { indexTsTemplate } from './templates/indexTs.js';
import { projectJsonTemplate } from './templates/projectJson.js';
import { tsconfigAppJsonTemplate } from './templates/tsconfigAppJson.js';
import { tsconfigBaseJsonTemplate } from './templates/tsconfigBaseJson.js';
import { tsconfigJsonTemplate } from './templates/tsconfigJson.js';
import { askQuestions, NXGOptions } from './questions.js';
import { createAFile, doCommand, nxGen } from './commands.js';

enum App {
  Server = 'server',
  Client = 'client',
  Next = 'next',
}

const createApp = async (
  pname: string,
  nx: string,
  type: App,
  appName: string,
) => {
  switch (type) {
    case App.Server:
      doCommand(`cd ${pname}/apps && mkdir ${appName}`);
      doCommand(`cd ${pname}/apps/${appName} && mkdir src`);
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
    case App.Client:
      // need to ideate
      break;
    case App.Next:
      doCommand(
        `cd ${pname} && ${nx} g @nx/next:app apps/${appName} --style=@emotion/styled --e2eTestRunner=none --appRouter=true --srcDir=true`,
      );
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
  doCommand('echo doing servers');
  await Promise.all(
    servers.map(
      async (appName: string) => await createApp(name, nx, App.Server, appName),
    ),
  );
  doCommand('echo doing clients');
  await Promise.all(
    clients.map(
      async (appName: string) => await createApp(name, nx, App.Client, appName),
    ),
  );
  doCommand('echo doing next if needed');
  nextjss.length > 0 && doCommand(nx + ' add @nx/next');
  doCommand('echo doing nexts');
  await Promise.all(
    nextjss.map(
      async (appName: string) => await createApp(name, nx, App.Next, appName),
    ),
  );

  ///

  doCommand(`cd ${name} && git add .`);
};

createProject();
