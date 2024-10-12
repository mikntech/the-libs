import { createRequire } from 'module';
import { cicdSettings } from '../../../config';
const require = createRequire(import.meta.url);

const { exec } = require('child_process');

const { region, keyID, secretKey } = cicdSettings.aws;

if (!region || !keyID || !secretKey) {
  console.error(
    'Please ensure REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY are set in the .env file.',
  );
  process.exit(1);
}

export const enableRegion = (regionToEnable: string) => {
  // Explicitly set credentials and region in the AWS CLI command
  const command = `aws configure set aws_access_key_id ${keyID} && \
                     aws configure set aws_secret_access_key ${secretKey} && \
                     aws configure set region ${region} && \
                     aws account enable-region --region-name ${regionToEnable}`;

  exec(command, (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.error(`Error enabling region: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`Region enabled successfully: ${stdout}`);
  });
};