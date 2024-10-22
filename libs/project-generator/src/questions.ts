import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { getSrcLibraries } from './automations.js';
const inquirer = require('inquirer').default;

export const askForAppsAndLibs = async () => {
  const libsNames = getSrcLibraries();
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

export const getList = async (name: string, message: string) => {
  const { listInput } = await inquirer.prompt([
    {
      type: 'input',
      name: name,
      message: message + '(comma-separated)',
    },
  ]);
  return listInput.split(',').map((input: string) => input.trim());
};

export const askQuestions = async () => {
  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of your new Nx project?',
    },
  ];
  return inquirer.prompt(questions);
};
