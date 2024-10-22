import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { getSrcLibraries } from './automations.js';
const inquirer = require('inquirer').default;

export enum NXGOptions {
  SUDO_INSTALL_GLOBAL = 'i -g',
  NX_IS_INSTALLED_GLOBAL = 'nx',
  USE_NPX = 'npx nx',
}

const askOneString = async (message: string) =>
  inquirer.prompt({
    type: 'input',
    name: 'val',
    message,
  });
const askListOfStrings = async (message: string) =>
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
const askOneFromOptions = async (message: string, choices: string[]) =>
  (
    await inquirer.prompt({
      type: 'list',
      name: 'askOneFromOptions',
      message,
      choices,
    })
  ).askOneFromOptions;
const askListFromOptions = async (message: string, choices: string[]) =>
  (
    await inquirer.prompt({
      type: 'checkbox',
      name: 'askListFromOptions',
      message,
      choices: choices,
    })
  ).askListFromOptions;

const askName = async () => {
  return askOneString('What is the name of your new Nx project?');
};
const askWhatLibsToInstall = async () =>
  askListFromOptions(
    'Select @the-libs you plan to use, I will "npm i" them for you',
    getSrcLibraries().map((name: string) => ({ name, value: name })),
  );

export const askQuestions = async () => {
  const name = await askName();
  const nxg = await askOneFromOptions(
    'How would you like to handle nx situation?',
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
