const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

export const getSrcLibraries = () => {
  const packageNamesPath = path.resolve(__dirname, 'packageNames.json');
  if (!fs.existsSync(packageNamesPath)) {
    console.error(
      'Error: packageNames.json not found. Make sure to generate it at compile time.',
    );
    return [];
  }
  return JSON.parse(fs.readFileSync(packageNamesPath, 'utf-8'));
};
