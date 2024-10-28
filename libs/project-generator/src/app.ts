import { indexTsTemplate } from './npx-utils/templates/indexTs.js';
import {
  projectJsonNextTemplate,
  projectJsonServerTemplate,
} from './npx-utils/templates/projectJson.js';
import { tsconfigAppJsonTemplate } from './npx-utils/templates/tsconfigAppJson.js';
import {
  tsconfigJsonNextTemplate,
  tsconfigJsonServerTemplate,
} from './npx-utils/templates/tsconfigJson.js';
import { doCommandInD } from './npx-utils/commands.js';
import { AppType } from './npx-utils/types.js';
import { nextConfigJsTemplate } from './npx-utils/templates/nextConfigJs.js';
import { nxJsonTemplate } from './npx-utils/templates/nxJson.js';
import { createAFile } from './npx-utils/fs.js';

export const createApp = async (
  pname: string,
  nx: string,
  type: AppType,
  appName: string,
) => {
  if (appName)
    switch (type) {
      case AppType.Server:
        doCommandInD(`${pname}/apps`, `mkdir -p ${appName}/src`);
        createAFile(
          'project.json',
          projectJsonServerTemplate(appName),
          './' + pname + '/apps/' + appName,
        );
        createAFile(
          'tsconfig.json',
          tsconfigJsonServerTemplate,
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
          `${nx} g @nx/next:app apps/${appName} --style=scss --e2eTestRunner=none --appRouter=true --srcDir=true`, // TODO: Bug
        );
        doCommandInD(`${pname}+/apps/${appName}`, 'rm -rf public/.gitkeep');
        doCommandInD(`${pname}+/apps/${appName}`, 'rm -rf specs');
        doCommandInD(`${pname}+/apps/${appName}`, 'rm -rf jest.config.ts');
        doCommandInD(`${pname}+/apps/${appName}`, 'rm -rf src/app/api');
        doCommandInD(`${pname}+/apps/${appName}`, 'rm -rf tsconfig.spec.json');
        doCommandInD(pname, 'rm -rf ./jest.config.ts');
        doCommandInD(pname, 'rm -rf ./jest.preset.ts');
        doCommandInD(`${pname}+/apps/${appName}`, 'rm -rf tsconfig.json');
        createAFile(
          'tsconfig.json',
          tsconfigJsonNextTemplate(appName),
          './' + pname + '/apps/' + appName,
        );
        doCommandInD(`${pname}+/apps/${appName}`, 'rm -rf project.json');
        createAFile(
          'project.json',
          projectJsonNextTemplate(appName),
          './' + pname + '/apps/' + appName,
        );
        doCommandInD(`${pname}+/apps/${appName}`, 'rm -rf next.config.js');
        createAFile(
          'next.config.js',
          nextConfigJsTemplate,
          './' + pname + '/apps/' + appName,
        );
        doCommandInD(pname, 'npm uninstall @testing-library/react --force');
        doCommandInD(pname, 'npm uninstall babel-jest --force');
        doCommandInD(pname, 'npm uninstall jest-environment-jsdom --force');
        doCommandInD(`${pname}`, 'rm -rf nx.json');
        createAFile('nx.json', nxJsonTemplate, './' + pname);
        break;
    }
};
