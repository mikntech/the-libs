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
const indexDtsFile = path.join(distDir, 'index.d.ts');
const indexTsFile = path.join(distDir, 'index.ts');

// Create an index.d.ts that exports types from the .d.ts files
const typeExportStatements = `export * from './src/index.d.ts';`;

// Create the index.d.ts file in the root of dist/libs/base-frontend
fs.writeFileSync(indexDtsFile, typeExportStatements);
console.log(
  `Created index.d.ts in the root with type exports from src/index.d.ts`,
);

// Create an index.ts that exports actual values from the .ts files
const tsExportStatements = fs
  .readdirSync(srcDir)
  .filter(
    (file) =>
      file !== 'index.ts' && fs.lstatSync(path.join(srcDir, file)).isFile(),
  )
  .map((file) => {
    // Export only .ts files (code)
    if (file.endsWith('.ts')) {
      return `export * from './src/${file}';`;
    }
    return '';
  })
  .filter(Boolean) // Filter out empty strings
  .join('\n');

// Write the new index.ts file to the root of dist/libs/base-frontend
fs.writeFileSync(indexTsFile, tsExportStatements);
console.log(`Created index.ts in the root with exports from .ts files`);
