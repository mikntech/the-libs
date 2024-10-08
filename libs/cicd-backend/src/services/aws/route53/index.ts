const {
  Route53Client,
  CreateHostedZoneCommand,
} = require('@aws-sdk/client-route-53');

const createHostedZone = async (region = 'us-east-1', domainName: string) => {
  const client = new Route53Client({ region });
  const params = {
    Name: domainName,
    CallerReference: `cli-script-${Date.now()}`,
  };
  try {
    const command = new CreateHostedZoneCommand(params);
    const response = await client.send(command);
    console.log('Hosted Zone Created Successfully:', response);
    return response;
  } catch (error) {
    console.error('Error creating hosted zone:', error);
  }
};
