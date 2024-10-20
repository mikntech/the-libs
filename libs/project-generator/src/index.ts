#!/usr/bin/env node

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const inquirer = require('inquirer').default;
import { execSync } from 'child_process';

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

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
  doCommand(`cat <<EOF >> ./${name}/.gitignore
# See http://help.github.com/ignore-files/ for more about ignoring files.


# Secrets and env
.env


# compiled output
dist
tmp
/out-tsc


# dependencies and platform
node_modules
package-lock.json


# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace


# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json


# Misc
/.sass-cache
/connect.lock
/coverage
/libpeerconnection.log
npm-debug.log
yarn-error.log
testem.log
/typings

# System Files
.DS_Store
Thumbs.db

# Cache
.nx

# Next.js
.next
out

EOF`);
  const libsToInstall = await askForAppsAndLibs();
  doCommand(
    `cd ${name} && npm i ${libsToInstall.map((x: string) => '@the-libs/' + x).join(' ')}`,
  );
  doCommand(`cd ${name} && npm i -D @nx/node`);
  const appName = 'example';
  doCommand(
    `cd ${name} && nx g @nx/node:application --directory=apps/${appName} --framework=none --e2eTestRunner=none --unitTestRunner=none`,
  );
  doCommand(`cd ${name} && rm -rf ./apps/${appName}/src/assets`);
  doCommand(`cd ${name} && rm -rf ./apps/${appName}/src/main.ts`);
  doCommand(`cd ${name} && touch ./apps/${appName}/src/index.ts`);
  doCommand(
    `cd ${name} && echo "console.log('im ready')" >> ./apps/${appName}/src/index.ts`,
  );

  doCommand(`cd ${name} && git add .`);
}

createProject();
