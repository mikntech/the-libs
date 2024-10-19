import * as fs from 'fs';
import * as path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate the src directory of packages (adjust path if necessary)
const srcDir = path.resolve(__dirname, '../');

// Read directories within src and filter out non-directories
const libs = fs
  .readdirSync(srcDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

// Write the library names to a JSON file for later use
fs.writeFileSync(
  path.resolve(__dirname, 'packageNames.json'),
  JSON.stringify(libs, null, 2),
);

console.log('Package names saved to packageNames.json');
