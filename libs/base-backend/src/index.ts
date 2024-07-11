export * from './config';
export * from './controllers';
export * from './exceptions';
export * from './schemas';
export * from './services';
export * from './types';

import { setup } from './services';
import { connect } from './schemas';
import { Router } from 'express';
import { baseSettings } from './config';

export const start = (
  apiRouter = Router(),
  middlewares: Function[] = [],
  watchDB = () => {},
) => {
  console.log('Connecting to MongoDB...');
  connect(baseSettings.mongoURI, baseSettings.stagingEnv, watchDB)
    .then(() => setup(apiRouter, middlewares).catch((e) => console.log(e)))
    .catch((e) => console.log(e));
};
