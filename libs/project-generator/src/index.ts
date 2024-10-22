#!/usr/bin/env node

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const inquirer = require('inquirer').default;
import { execSync } from 'child_process';

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { gitignoreTemplate } from './templates/gitignore.js';
import { indexTsTemplate } from './templates/indexTs.js';
import { projectJsonTemplate } from './templates/projectJson.js';
import { tsconfigAppJsonTemplate } from './templates/tsconfigAppJson.js';
import { tsconfigBaseJsonTemplate } from './templates/tsconfigBaseJson.js';
import { tsconfigJsonTemplate } from './templates/tsconfigJson.js';

// Define __filename and __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package names from generated JSON file
const getSrcLibraries = () => {
  const packageNamesPath = path.resolve(__dirname, 'packageNames.json');
  if (!fs.existsSync(packageNamesPath)) {
    console.error(
      'Error: packageNames.json not found. Make sure to generate it at compile time.',
    );
    return [];
  }

  const libs = JSON.parse(fs.readFileSync(packageNamesPath, 'utf-8'));
  return libs;
};

const askForAppsAndLibs = async () => {
  const libsNames = getSrcLibraries(); // Read src libs from JSON file
  const choices = libsNames.map((name: string) => ({ name, value: name }));
  const questions = [
    {
      type: 'checkbox',
      name: 'selectedItems',
      message: 'Select @the-libs you plan to use, I will "npm i" them for you',
      choices: choices,
    },
  ];
  const answers = await inquirer.prompt(questions);
  return answers.selectedItems;
};

const doCommand = (cmnd: string) =>
  execSync(cmnd, {
    stdio: 'inherit',
  });

const getList = async (name: string, message: string) => {
  const { listInput } = await inquirer.prompt([
    {
      type: 'input',
      name: name,
      message: message + '(comma-separated)',
    },
  ]);
  return listInput.split(',').map((input: string) => input.trim());
};

const askQuestions = async () => {
  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of your new Nx project?',
    },
  ];
  return inquirer.prompt(questions);
};

const createAFile = (name: string, content: string, path: string = './') =>
  doCommand(
    'cd ' +
      path +
      ' && ' +
      'cat <<EOF >> ./' +
      name +
      `
  ${content}`,
  );

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
