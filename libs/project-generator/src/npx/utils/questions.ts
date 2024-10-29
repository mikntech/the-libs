import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { getSrcLibraries } from './automations.js';
const inquirer = require('inquirer').default;

export enum NXGOptions {
  SUDO_INSTALL_GLOBAL = 'i -g',
  NX_IS_INSTALLED_GLOBAL = 'nx',
  USE_NPX = 'npx nx',
}

export enum WhatToDo {
  NEW_PROJECT = 'create a new project - im in the desired parent dir now',
  NEW_APP = "create an app - im in my monorepo's root now",
  NEW_LIB = "create a lib - im in my monorepo's root now",
}

const askOneString = async (message: string): Promise<string> =>
  (
    await inquirer.prompt({
      type: 'input',
      name: 'askOneString',
      message,
    })
  )['askOneString'];
const askListOfStrings = async (message: string): Promise<string[]> =>
  (
    await inquirer.prompt([
      {
        type: 'input',
        name: 'askListOfStrings',
        message: message + ' (comma-separated, no spaces needed)',
      },
    ])
  ).askListOfStrings
    .split(',')
    .map((input: string) => input.trim());
const askOneFromOptions = async (
  message: string,
  choices: string[],
): Promise<string> =>
  (
    await inquirer.prompt({
      type: 'list',
      name: 'askOneFromOptions',
      message,
      choices,
    })
  )['askOneFromOptions'];
const askListFromOptions = async (
  message: string,
  choices: string[],
): Promise<string[]> =>
  (
    await inquirer.prompt({
      type: 'checkbox',
      name: 'askListFromOptions',
      message,
      choices: choices,
    })
  )['askListFromOptions'];

const askName = async () =>
  askOneString('What is the name of your new Nx project?');

const askWhatLibsToInstall = async () =>
  askListFromOptions(
    'Select @the-libs you plan to use, I will "npm i" them for you',
    getSrcLibraries().map((name: string) => ({ name, value: name })),
  );

export const askProjectQuestions = async () => {
  const name = await askName();
  const nxg = await askOneFromOptions(
    'How would you like to handle nx cli situation?',
    Object.keys(NXGOptions),
  );
  const libsToInstall = await askWhatLibsToInstall();
  const servers = await askListOfStrings(
    'enter all the servers you want to generate',
  );
  const clients = await askListOfStrings(
    'enter all the vanilla react clients you want to generate',
  );
  const nextjss = await askListOfStrings(
    'enter all the nextjs you want to generate',
  );
  return { name, nxg, libsToInstall, servers, clients, nextjss };
};

export const whatToDo = async () =>
  askOneFromOptions('How do you want to do?', Object.values(WhatToDo));
