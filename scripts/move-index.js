import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the library name or directory from arguments
const libName = process.argv[2];
if (!libName) {
  console.error('Please provide the library name as an argument.');
  process.exit(1);
}

// Define paths
const distDir = path.join(__dirname, `../dist/libs/${libName}`);
const srcDir = path.join(distDir, 'src');
const indexTsFile = path.join(distDir, 'index.d.ts');

// Create an index.d.ts that exports everything from the src folder
const files = fs.readdirSync(srcDir);
const exportStatements = files
  .filter(
    (file) =>
      file !== 'index.ts' && fs.lstatSync(path.join(srcDir, file)).isFile(),
  )
  .map((file) => `export * from './src/${file}';`)
  .join('\n');

// Write the new index.d.ts file to the root of dist/libs/base-frontend
fs.writeFileSync(indexTsFile, exportStatements);
console.log(`Created index.d.ts in the root with re-exports from src/`);

// No need to remove or move files now, since we are simply creating the index.d.ts
