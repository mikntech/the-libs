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
  const list = listInput.split(',').map((app) => app.trim());
  return list;
};

const askQuestions = async () => {
  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of your new Nx project?',
    },
    {
      type: 'list',
      name: 'template',
      message: 'Which template would you like to use?',
      choices: ['react', 'angular', 'node'],
    },
  ];
  return inquirer.prompt(questions);
};

async function createProject() {
  const answers = await askQuestions();
  doCommand(`npx create-nx-workspace`);
}

createProject();
