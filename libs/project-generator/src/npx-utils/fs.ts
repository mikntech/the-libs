import { promises as fs } from 'fs';
import { doCommand } from './commands.js';

export const createAFile = (
  name: string,
  content: string,
  path: string = './',
) =>
  doCommand(
    'cd ' +
      path +
      ' && ' +
      'cat <<EOF >> ./' +
      name +
      `
  ${content}`,
  );

const setDeep = (obj: {}, path: string, value: any) => {
  const keys = path.split('.');
  let current: any = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }

  const lastKey = keys[keys.length - 1];
  if (value === null) {
    delete current[lastKey];
  } else {
    current[lastKey] = value;
  }
};

export const modifyJsonFile = async (filePath: string, changes: {}) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');

    const json = JSON.parse(data);

    for (const [path, value] of Object.entries(changes)) {
      setDeep(json, path, value);
    }

    await fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf-8');
    console.log(`Modified ${filePath} successfully.`);
  } catch (error) {
    console.error(`Error modifying ${filePath}:`, error);
  }
};
