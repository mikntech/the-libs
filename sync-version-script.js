const fs = require('fs');
const path = require('path');

const rootPackageJsonPath = path.join(__dirname, './package.json');
const rootPackageJson = require(rootPackageJsonPath);
const rootVersion = rootPackageJson.version;

if (!rootVersion) {
  console.error('No version found in the root package.json.');
  process.exit(1);
}

const libsPath = path.join(__dirname, './libs');

try {
  const subfolders = fs.readdirSync(libsPath).filter((subfolder) => {
    return fs.statSync(path.join(libsPath, subfolder)).isDirectory();
  });

  subfolders.forEach((libName) => {
    const subfolderPackageJsonPath = path.join(
      libsPath,
      libName,
      'package.json',
    );

    if (fs.existsSync(subfolderPackageJsonPath)) {
      const subfolderPackageJson = require(subfolderPackageJsonPath);
      subfolderPackageJson.version = rootVersion;

      fs.writeFileSync(
        subfolderPackageJsonPath,
        JSON.stringify(subfolderPackageJson, null, 2),
        'utf-8',
      );
      console.log(
        `Updated version in ${libName}/package.json to ${rootVersion}`,
      );
    } else {
      console.log(`No package.json found in ${libName}, skipping...`);
    }
  });
} catch (error) {
  console.error(`Failed to update versions:`, error.message);
  process.exit(1);
}
