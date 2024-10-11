import { createRequire } from 'module';
import { createClient } from '../utils';
import { TODO } from '@the-libs/base-shared';
const require = createRequire(import.meta.url);

const {
  ACMClient,
  RequestCertificateCommand,
  DescribeCertificateCommand,
} = require('@aws-sdk/client-acm');
const {
  Route53Client,
  ListHostedZonesByNameCommand,
  ChangeResourceRecordSetsCommand,
} = require('@aws-sdk/client-route-53');

const getHostedZoneId = async (domainName: string) => {
  const route53Client = createClient<typeof Route53Client>(Route53Client);

  const parts = domainName.split('.');

  // Iterate through each possible zone, from subdomain up to root domain
  for (let i = 0; i < parts.length - 1; i++) {
    const searchDomain = parts.slice(i).join('.') + '.';

    const params = { DNSName: searchDomain };
    const command = new ListHostedZonesByNameCommand(params);

    try {
      const response = await route53Client.send(command);
      const hostedZone = response.HostedZones.find(
        (zone: { Name: string }) => zone.Name === searchDomain,
      );

      if (hostedZone) {
        console.log('Found hosted zone ID:', hostedZone.Id);
        return hostedZone.Id.replace('/hostedzone/', ''); // Clean ID
      }
    } catch (error) {
      console.error(
        `Error retrieving hosted zone ID for ${searchDomain}:`,
        error,
      );
    }
  }

  throw new Error(
    `No hosted zone found for domain or any parent domains: ${domainName}`,
  );
};

export const requestCertificate = async (domainName: string) => {
  const acmClient = createClient<typeof ACMClient>(ACMClient);

  const route53Client = createClient<typeof Route53Client>(Route53Client);

  const hostedZoneId = await getHostedZoneId(domainName);
  if (!hostedZoneId) {
    console.error('Hosted zone ID not found, aborting certificate request.');
    return;
  }

  // Step 1: Request a certificate
  const certParams = {
    DomainName: domainName,
    ValidationMethod: 'DNS',
  };

  try {
    const requestCommand = new RequestCertificateCommand(certParams);
    const certResponse = await acmClient.send(requestCommand);
    const certificateArn = certResponse.CertificateArn;
    console.log('Certificate requested:', certificateArn);

    // Step 2: Poll ACM to ensure DNS validation options are available
    let validationOptions;
    for (let attempt = 0; attempt < 5; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds between attempts
      const describeCommand = new DescribeCertificateCommand({
        CertificateArn: certificateArn,
      });
      const certDetails = await acmClient.send(describeCommand);
      validationOptions = certDetails.Certificate.DomainValidationOptions;

      // Break out of loop if validation options are available
      if (validationOptions.every((option: TODO) => option.ResourceRecord)) {
        break;
      }
      console.log(
        `Waiting for DNS validation records... Attempt ${attempt + 1}`,
      );
    }

    // Step 3: Create DNS validation records in Route 53
    for (const option of validationOptions) {
      const { ResourceRecord } = option;
      if (ResourceRecord) {
        const dnsParams = {
          HostedZoneId: hostedZoneId,
          ChangeBatch: {
            Changes: [
              {
                Action: 'UPSERT',
                ResourceRecordSet: {
                  Name: ResourceRecord.Name,
                  Type: ResourceRecord.Type,
                  TTL: 300,
                  ResourceRecords: [{ Value: ResourceRecord.Value }],
                },
              },
            ],
          },
        };

        const dnsCommand = new ChangeResourceRecordSetsCommand(dnsParams);
        await route53Client.send(dnsCommand);
        console.log('DNS validation record created for:', domainName);
      } else {
        console.error('Validation record is missing in ACM response.');
      }
    }

    console.log('Certificate request and DNS validation setup completed.');
  } catch (error) {
    console.error(
      'Error requesting certificate or creating DNS record:',
      error,
    );
  }
};

export const checkValidationStatus = async (
  certificateArn: string,
  attempts: number = Number.MAX_SAFE_INTEGER,
) => {
  const acmClient = createClient<typeof ACMClient>(ACMClient);

  for (let attempt = 0; attempt < attempts; attempt++) {
    // 12 attempts * 5 minutes = 1 hour max
    await new Promise((resolve) => setTimeout(resolve, 300000)); // Wait 5 minutes

    const describeCommand = new DescribeCertificateCommand({
      CertificateArn: certificateArn,
    });
    const certDetails = await acmClient.send(describeCommand);
    const status = certDetails.Certificate.Status;

    console.log(`Validation status: ${status} (Attempt ${attempt + 1})`);

    if (status === 'ISSUED') {
      console.log('Certificate successfully validated and issued.');
      return;
    }
  }
  console.log(
    'Validation is still pending. Check the ACM console for more details.',
  );
};
