#!/usr/bin/env node

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const inquirer = require('inquirer').default;
import { execSync } from 'child_process';

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
  doCommand(`npx --yes create-nx-workspace@latest ${name} \\
  --preset=none \\
  --nxCloud=skip \\
  --ci=skip \\
  --packageManager=npm \\
  --style=css \\
  --interactive=false \\
  --skipGit=false \\
  --npmScope=${name}`);
}

createProject();
