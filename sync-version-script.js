const fs = require('fs');
const path = require('path');

const rootPackageJsonPath = path.join(__dirname, './package.json');
const rootPackageJson = require(rootPackageJsonPath);
const rootVersion = rootPackageJson.version;

if (!rootVersion) {
  
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
      
        `Updated version in ${libName}/package.json to ${rootVersion}`,
      );
    } else {
      
    }
  });
} catch (error) {
  
  process.exit(1);
}
