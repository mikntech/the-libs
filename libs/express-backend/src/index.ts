import { startExpress } from './api';

export * from './api/express';
export * from './config';
export * from './db/mongo';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import { getExpressSettings } from './config';
import { connect, mongoSettings } from '@the-libs/mongo-backend';

//TODO: Move to quickstarts lib!!
export const startMongoAndExpress = <CB extends { [s: string]: string }>(
  apiRouter = Router(),
  preMiddlewares: Function[] = [],
  postMiddlewares: Function[] = [],
  logMongoToConsole: boolean = true,
  disableCors: boolean = false,
) => {
  console.log('Connecting to MongoDB...');
  connect(
    mongoSettings.mongoURI,
    getExpressSettings().stagingEnv,
    logMongoToConsole,
  )
    .then(() =>
      startExpress<CB>(
        apiRouter,
        preMiddlewares,
        postMiddlewares,
        disableCors,
      ).catch((e) => console.log(e)),
    )
    .catch((e) => console.log(e));
};
