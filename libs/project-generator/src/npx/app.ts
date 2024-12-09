import { indexTsTemplate } from './utils/templates/indexTs.js';
import {
  projectJsonNextTemplate,
  projectJsonServerTemplate,
} from './utils/templates/projectJson.js';
import { tsconfigAppJsonTemplate } from './utils/templates/tsconfigAppJson.js';
import {
  tsconfigJsonNextTemplate,
  tsconfigJsonServerTemplate,
} from './utils/templates/tsconfigJson.js';
import { doCommandInD, nxGen } from './utils/commands.js';
import { AppType } from '../types.js';
import { nextConfigJsTemplate } from './utils/templates/nextConfigJs.js';
import { nxJsonTemplate } from './utils/templates/nxJson.js';
import { createAFile } from './utils/fs.js';
import {
  askOneFromOptions,
  askOneString,
  NXGOptions,
} from './utils/questions.js';

export const createSingleApp = async () => {
  const name = await askOneString('What name do you want for you app?');
  const nx = nxGen(
    await askOneFromOptions<keyof typeof NXGOptions>(
      'How would you like to handle nx cli situation?',
      Object.keys(NXGOptions) as (keyof typeof NXGOptions)[],
    ),
  );
  const type: keyof typeof AppType = (await askOneFromOptions<keyof AppType>(
    'Waht type of app do you want?',
    Object.keys(AppType) as (keyof AppType)[],
  )) as any;
  await createApp(null, nx, AppType[type], name);
};

export const createApp = async (
  pname: string | null,
  nx: string,
  type: AppType,
  appName: string,
) => {
  if (appName)
    switch (type) {
      case AppType.Server:
        doCommandInD(
          `${pname === null ? '' : pname + '/'}apps`,
          `mkdir -p ${appName}/src`,
        );
        createAFile(
          'project.json',
          projectJsonServerTemplate(appName),
          './' + (pname === null ? '' : pname + '/') + 'apps/' + appName,
        );
        createAFile(
          'tsconfig.json',
          tsconfigJsonServerTemplate,
          './' + (pname === null ? '' : pname + '/') + 'apps/' + appName,
        );
        createAFile(
          'tsconfig.app.json',
          tsconfigAppJsonTemplate,
          './' + (pname === null ? '' : pname + '/') + 'apps/' + appName,
        );
        createAFile(
          'index.ts',
          indexTsTemplate,
          './' +
            (pname === null ? '' : pname + '/') +
            'apps/' +
            appName +
            '/src',
        );
        break;
      case AppType.Client:
        doCommandInD(
          pname ?? './',
          `${nx} g @nx/react:app apps/${appName} --bundler=vite --style=@emotion/styled --appRouter=false --e2eTestRunner=none --interactive=false`,
        );
        break;
      case AppType.Next:
        doCommandInD(
          pname ?? './',
          `${nx} g @nx/next:app apps/${appName} --style=scss --e2eTestRunner=none --appRouter=true --srcDir=true \\
           --interactive=false \\`,
        );
        doCommandInD(
          `${pname === null ? '' : pname + '/'}apps/${appName}`,
          'rm -rf public/.gitkeep',
        );
        doCommandInD(
          `${pname === null ? '' : pname + '/'}apps/${appName}`,
          'rm -rf specs',
        );
        doCommandInD(
          `${pname === null ? '' : pname + '/'}apps/${appName}`,
          'rm -rf jest.config.ts',
        );
        doCommandInD(
          `${pname === null ? '' : pname + '/'}apps/${appName}`,
          'rm -rf src/app/api',
        );
        doCommandInD(
          `${pname === null ? '' : pname + '/'}apps/${appName}`,
          'rm -rf tsconfig.spec.json',
        );
        doCommandInD(pname ?? './', 'rm -rf ./jest.config.ts');
        doCommandInD(pname ?? './', 'rm -rf ./jest.preset.ts');
        doCommandInD(
          `${pname === null ? '' : pname + '/'}apps/${appName}`,
          'rm -rf tsconfig.json',
        );
        createAFile(
          'tsconfig.json',
          tsconfigJsonNextTemplate(appName),
          './' + (pname === null ? '' : pname + '/') + 'apps/' + appName,
        );
        doCommandInD(
          `${pname === null ? '' : pname + '/'}apps/${appName}`,
          'rm -rf project.json',
        );
        createAFile(
          'project.json',
          projectJsonNextTemplate(appName),
          './' + (pname === null ? '' : pname + '/') + 'apps/' + appName,
        );
        doCommandInD(
          `${pname === null ? '' : pname + '/'}apps/${appName}`,
          'rm -rf next.config.js',
        );
        createAFile(
          'next.config.js',
          nextConfigJsTemplate,
          './' + (pname === null ? '' : pname + '/') + 'apps/' + appName,
        );
        doCommandInD(
          pname ?? './',
          'npm uninstall @testing-library/react --force',
        );
        doCommandInD(pname ?? './', 'npm uninstall babel-jest --force');
        doCommandInD(
          pname ?? './',
          'npm uninstall jest-environment-jsdom --force',
        );
        doCommandInD(`${pname ?? './'}`, 'rm -rf nx.json');
        createAFile('nx.json', nxJsonTemplate, './' + (pname ?? ''));
        doCommandInD(
          `${pname === null ? '' : pname + '/'}apps/${appName}`,
          'rm -rf eslint.config.js',
        );
        break;
    }
};
