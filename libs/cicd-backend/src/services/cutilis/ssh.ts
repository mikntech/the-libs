import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { exec } = require('child_process');
const { promises: fsPromises } = require('fs');
const os = require('os');
const path = require('path');

export const generateSSHKey = (
  log: boolean = true,
  email = 'your_email@example.com',
): Promise<{ privateKey: string; publicKey: string }> =>
  new Promise(async (resolve, reject) => {
    const tempDir = await fsPromises.mkdtemp(
      path.join(os.tmpdir(), 'ssh-keygen-'),
    );
    const privateKeyPath = path.join(tempDir, 'id_ed25519');
    const publicKeyPath = `${privateKeyPath}.pub`;
    const command = `ssh-keygen -t ed25519 -C "${email}" -N "" -f "${privateKeyPath}"`;
    exec(command, async (error: any, stdout: any, stderr: any) => {
      if (error) {
        reject(`Error generating SSH key: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Standard error: ${stderr}`);
        return;
      }
      try {
        const privateKey = await fsPromises.readFile(privateKeyPath, 'utf8');
        const publicKey = await fsPromises.readFile(publicKeyPath, 'utf8');
        await fsPromises.unlink(privateKeyPath);
        await fsPromises.unlink(publicKeyPath);
        await fsPromises.rmdir(tempDir);
        console.log(
          'Private Key:\n',
          JSON.stringify(privateKey, null, 2)
            .replace(/\\n/g, '\n')
            .replace(/"/g, ''),
        );
        console.log('Public Key:\n', publicKey);
        resolve({ privateKey, publicKey });
      } catch (readError: any) {
        reject(`Error reading keys: ${readError?.message || readError}`);
      }
    });
  });
