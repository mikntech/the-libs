import { gitignoreTemplate } from './utils/templates/gitignore.js';
import { tsconfigBaseJsonTemplate } from './utils/templates/tsconfigBaseJson.js';
import { askProjectQuestions } from './utils/questions.js';
import { doCommand, doCommandInD, log, nxGen } from './utils/commands.js';
import { AppType } from '../types.js';
import { modifyJsonFile, createAFile } from './utils/fs.js';
import { createApp } from './app.js';

export const createProject = async () => {
  const {
    name: pname,
    nxg,
    libsToInstall,
    servers,
    clients,
    nextjss,
  } = await askProjectQuestions();
  const nx = nxGen(nxg);
  nxg === 'SUDO_INSTALL_GLOBAL' &&
    doCommand('sudo npm i --legacy-peer-deps -g nx');
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
    `npm i --legacy-peer-deps ${libsToInstall.map((x: string) => '@the-libs/' + x).join(' ')}`,
  );
  doCommandInD(pname, `mkdir apps`);
  doCommandInD(pname, `npm i --legacy-peer-deps -D @nx/esbuild`);
  doCommandInD(pname, `npm i --legacy-peer-deps -D esbuild`);
  doCommandInD(pname, `rm -f ./tsconfig.base.json`);
  createAFile('tsconfig.base.json', tsconfigBaseJsonTemplate, './' + pname);
  await modifyJsonFile(`./${pname}/tsconfig.json`, {
    references: null,
  });
  doCommandInD(pname, 'npm i --legacy-peer-deps -D @nx/react');
  log('doing servers');
  await Promise.all(
    servers.map(
      async (appName: string) =>
        await createApp(pname, nx, AppType.Server, appName),
    ),
  );
  log('doing vite if needed');
  nextjss.some((appName: string) => appName !== '') &&
    doCommandInD(pname, 'nx add @nx/vite --setupPathsPlugin');
  log('doing clients');
  await Promise.all(
    clients.map(
      async (appName: string) =>
        await createApp(pname, nx, AppType.Client, appName),
    ),
  );
  log('doing next if needed');
  nextjss.some((appName: string) => appName !== '') &&
    doCommandInD(pname, 'npm i --legacy-peer-deps -D @nx/next');
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
