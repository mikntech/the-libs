import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { config } = require('dotenv');
config();

export const googlemapsSettings = {
  googleGeoCoding: process.env['GOOGLE_GEO_CODING'] ?? '',
  googleClientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
  googleClientSecret: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
};
