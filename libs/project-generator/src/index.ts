#!/usr/bin/env node

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const inquirer = require('inquirer').default;
import { execSync } from 'child_process';

async function askQuestions() {
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
}

async function createProject() {
  const answers = await askQuestions();

  console.log(
    `Creating a ${answers.template} project named ${answers.name}...`,
  );

  execSync(`npx nx g @nx/${answers.template}:app ${answers.name}`, {
    stdio: 'inherit',
  });

  console.log('Project creation complete!');
}

createProject();
