import { gitignoreTemplate } from './npx-utils/templates/gitignore.js';
import { tsconfigBaseJsonTemplate } from './npx-utils/templates/tsconfigBaseJson.js';
import { askQuestions } from './npx-utils/questions.js';
import { doCommand, doCommandInD, log, nxGen } from './npx-utils/commands.js';
import { AppType } from './npx-utils/types.js';
import { modifyJsonFile, createAFile } from './npx-utils/fs.js';
import { createApp } from './app.js';

export const createProject = async () => {
  const {
    name: pname,
    nxg,
    libsToInstall,
    servers,
    clients,
    nextjss,
  } = await askQuestions();
  const nx = nxGen(nxg);
  nxg === 'SUDO_INSTALL_GLOBAL' && doCommand('sudo npm i -g nx');
  doCommand(`npx --yes create-nx-workspace@latest ${pname} \\
  --preset=ts \\
  --nxCloud=skip \\
  --packageManager=npm \\
  --interactive=false \\
  --skipGit=false \\
  --npmScope=${pname}`);
  doCommandInD(`${pname}`, `rm -rf packages`);
  doCommandInD(`${pname}`, `rm -rf README.md`);
  doCommandInD(`${pname}`, `rm -rf .gitignore`);
  createAFile('.gitignore', gitignoreTemplate, pname);
  doCommandInD(
    pname,
    `npm i ${libsToInstall.map((x: string) => '@the-libs/' + x).join(' ')}`,
  );
  doCommandInD(pname, `mkdir apps`);
  doCommandInD(pname, `npm i -D @nx/esbuild`);
  doCommandInD(pname, `npm i -D esbuild`);
  doCommandInD(pname, `rm -f ./tsconfig.base.json`);
  createAFile('tsconfig.base.json', tsconfigBaseJsonTemplate, './' + pname);
  await modifyJsonFile(`./${pname}/tsconfig.json`, {
    references: null,
  });
  log('doing servers');
  await Promise.all(
    servers.map(
      async (appName: string) =>
        await createApp(pname, nx, AppType.Server, appName),
    ),
  );
  log('doing clients');
  await Promise.all(
    clients.map(
      async (appName: string) =>
        await createApp(pname, nx, AppType.Client, appName),
    ),
  );
  log('doing next if needed');
  nextjss.some((appName: string) => appName !== '') &&
    doCommandInD(pname, 'npm i -D @nx/next');
  log('doing nexts');
  await Promise.all(
    nextjss.map(
      async (appName: string) =>
        await createApp(pname, nx, AppType.Next, appName),
    ),
  );

  // TODO: cicd?

  doCommandInD(pname, `git add .`);

  // TODO: commit with creditfull message or input?
  // TODO: define remote and push, after asking for an empty newborn repo?
};
