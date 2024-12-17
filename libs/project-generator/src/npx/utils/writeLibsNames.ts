import * as fs from 'fs';
import * as path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, '../../../../');

const libs = fs
  .readdirSync(srcDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .filter((name) => name !== 'project-generator');

fs.writeFileSync(
  path.resolve(__dirname, 'packageNames.json'),
  JSON.stringify(libs, null, 2),
);

console.log('Package names saved to packageNames.json');
