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

// Create an index.ts that exports types from the .d.ts files
const exportStatements = `export type * from './src/index.d.ts';`;

// Write the new index.ts file to the root of dist/libs/base-frontend
fs.writeFileSync(indexTsFile, exportStatements);
console.log(
  `Created index.ts in the root with 'export type *' from index.d.ts`,
);
