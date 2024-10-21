#!/usr/bin/env node

export const gitignoreTemplate = `
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
`;

export const indexTsTemplate = `
console.log('working');`;

export const projectJsonTemplate = (appName: string) => `
{
  "name": "${appName}",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/${appName}/src",
  "projectType": "application",
  "targets": {
    "build": {
      "executor": "@nx/esbuild:esbuild",
      "outputs": [
        "{options.outputPath}"
      ],
      "defaultConfiguration": "production",
      "options": {
        "platform": "node",
        "outputPath": "dist/apps/${appName}",
        "format": [
          "esm"
        ],
        "bundle": true,
        "main": "apps/${appName}/src/index.ts",
        "tsConfig": "apps/${appName}/tsconfig.app.json",
        "external": [
          "aws-sdk",
          "mock-aws-s3",
          "nock"
        ],
        "esbuildOptions": {
          "sourcemap": true,
          "outExtension": {
            ".js": ".mjs"
          }
        }
      },
      "configurations": {
        "development": {},
        "production": {
          "esbuildOptions": {
            "sourcemap": false,
            "minify": true,
            "outExtension": {
              ".js": ".mjs"
            }
          }
        }
      }
    },
    "serve": {
      "executor": "@nx/js:node",
      "defaultConfiguration": "development",
      "options": {
        "buildTarget": "${appName}:build"
      },
      "configurations": {
        "development": {
          "buildTarget": "${appName}:build:development"
        },
        "production": {
          "buildTarget": "${appName}:build:production"
        }
      },
      "dependsOn": [
        {
          "projects": "dependencies",
          "target": "build"
        }
      ]
    }
  },
  "tags": []
}
`;

export const tsconfigAppJsonTemplate = `
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "es2022",
    "types": [
      "node"
    ]
  },
  "exclude": [
    "src/**/*.spec.ts",
    "src/**/*.test.ts"
  ],
  "include": [
    "src/**/*.ts"
  ]
}

`;

export const tsconfigJsonTemplate = `
{
  "extends": "../../tsconfig.base.json",
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    }
  ],
  "compilerOptions": {
    "esModuleInterop": true
  }
}

`;

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const inquirer = require('inquirer').default;
import { execSync } from 'child_process';

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
/*import {
  gitignoreTemplate,
  indexTsTemplate,
  projectJsonTemplate,
  tsconfigAppJsonTemplate,
  tsconfigJsonTemplate,
} from './templates';*/

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

  doCommand(`cd ${name} && git add .`);
}

createProject();
