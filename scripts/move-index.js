const fs = require('fs');
const path = require('path');

// Define paths
const distDir = path.join(__dirname, '../dist/libs/base-frontend');
const srcDir = path.join(distDir, 'src');
const indexFile = path.join(srcDir, 'index.d.ts');

// Check if `index.d.ts` exists in `src`
if (fs.existsSync(indexFile)) {
  // Move `index.d.ts` to the root of `dist/libs/base-frontend`
  const targetPath = path.join(distDir, 'index.d.ts');
  fs.renameSync(indexFile, targetPath);
  console.log(`Moved index.d.ts to: ${targetPath}`);
} else {
  console.log('index.d.ts not found in src folder.');
}

// Remove the `src` folder
if (fs.existsSync(srcDir)) {
  fs.rmSync(srcDir, { recursive: true, force: true });
  console.log('Removed src folder from dist directory.');
}
