import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { getSrcLibraries } from './automations.js';
const inquirer = require('inquirer').default;

const askName = async () => {
  const question = {
    type: 'input',
    name: 'name',
    message: 'What is the name of your new Nx project?',
  };
  return inquirer.prompt(question);
};

const askWhatLibsToInstall = async () => {
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

const getList = async (message: string) => {
  const { listInput } = await inquirer.prompt([
    {
      type: 'input',
      name: 'listInput',
      message: message + ' (comma-separated)',
    },
  ]);
  return listInput.split(',').map((input: string) => input.trim());
};

export const askQuestions = async () => {
  const name = await askName();
  const libsToInstall = await askWhatLibsToInstall();
  const servers = await getList('enter all the servers you want to generate');
  const clients = await getList(
    'enter all the vanilla react clients you want to generate',
  );
  const nexts = await getList('enter all the nextjs you want to generate');
  return { name, libsToInstall };
};
