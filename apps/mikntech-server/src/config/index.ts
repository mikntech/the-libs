import {
  validateSettings,
  getExpressSettings,
} from '@the-libs/express-backend';
import { mongoSettings } from '@the-libs/mongo-backend';

export const settings = {
  ...getExpressSettings(),
  ...mongoSettings,
};

validateSettings(settings);
