#!/usr/bin/env node

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const inquirer = require('inquirer').default;
import { execSync } from 'child_process';

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  indexTs,
  projectJsonTemplate,
  tsconfigAppJsonTemplate,
  tsconfigJsonTemplate,
} from './templates';
import { dotGitIgnoreTemplate } from './templates/gitignore.ts';

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
  console.log('Libraries found in src:', libs);
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
      'cat <<EOF >> ' +
      name +
      `
  ${content}
  
  EOF`,
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
  createAFile('.gitignore', dotGitIgnoreTemplate, name);
  const libsToInstall = await askForAppsAndLibs();
  doCommand(
    `cd ${name} && npm i ${libsToInstall.map((x: string) => '@the-libs/' + x).join(' ')}`,
  );
  const appName = 'example';
  doCommand(`cd ${name} && mkdir ./apps/${appName}`);
  doCommand(`cd ${name} && mkdir ./apps/${appName}/src`);
  createAFile('project.json', projectJsonTemplate(name), './' + name);
  createAFile('tsconfig.json', tsconfigJsonTemplate, './' + name);
  createAFile('tsconfig.app.json', tsconfigAppJsonTemplate, './' + name);
  createAFile('index.ts', indexTs, './' + name + '/apps/' + name + '/src');
  doCommand(`cd ${name} && nx build ` + name);
  doCommand(`cd ${name} && nx serve ` + name);

  doCommand(`cd ${name} && git add .`);
}

createProject();
