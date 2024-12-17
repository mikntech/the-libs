import { createRequire } from 'module';
import { cicdSettings } from '../../../config';
const require = createRequire(import.meta.url);

const { exec } = require('child_process');

const { region, keyID, secretKey } = cicdSettings.aws;

export const enableRegion = (regionToEnable: string) => {
  if (!region || !keyID || !secretKey) {
    
      'Please ensure AWS_KEY_ID, AWS_SECRET_KEY, AWS_REGION are set in the .env file.',
    );
    process.exit(1);
  }
  // Explicitly set credentials and region in the AWS CLI command
  const command = `aws configure set aws_access_key_id ${keyID} && \
                     aws configure set aws_secret_access_key ${secretKey} && \
                     aws configure set region ${region} && \
                     aws account enable-region --region-name ${regionToEnable}`;

  exec(command, (error: any, stdout: any, stderr: any) => {
    if (error) {
      
      return;
    }
    if (stderr) {
      
      return;
    }
  });
};
