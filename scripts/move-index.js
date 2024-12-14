const fs = require('fs');
const path = require('path');

// Get the library name or directory from arguments
const libName = process.argv[2];
if (!libName) {
  console.error('Please provide the library name as an argument.');
  process.exit(1);
}

// Define paths
const distDir = path.join(__dirname, `../dist/libs/${libName}`);
const srcDir = path.join(distDir, 'src');
const indexTsFile = path.join(distDir, 'index.ts');

// Create an index.ts that exports everything from the src folder
const files = fs.readdirSync(srcDir);
const exportStatements = files
  .filter(
    (file) =>
      file !== 'index.ts' && fs.lstatSync(path.join(srcDir, file)).isFile(),
  )
  .map((file) => {
    // Make sure we only export .ts files (excluding .d.ts files)
    if (file.endsWith('.ts')) {
      return `export * from './src/${file}';`;
    }
    return '';
  })
  .filter(Boolean) // Filter out empty strings
  .join('\n');

// Write the new index.ts file to the root of dist/libs/base-frontend
fs.writeFileSync(indexTsFile, exportStatements);
console.log(`Created index.ts in the root with re-exports from src/`);
