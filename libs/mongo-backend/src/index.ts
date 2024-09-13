import { startExpress } from './api';

export * from './api/express';
export * from './config';
export * from './controllers';
export * from './db/mongo';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import { getBaseSettings } from './config';
import { connect } from './db/mongo';

export const startMongoAndExpress = <CB extends { [s: string]: string }>(
  apiRouter = Router(),
  preMiddlewares: Function[] = [],
  postMiddlewares: Function[] = [],
  logMongoToConsole: boolean = true,
  disableCors: boolean = false,
) => {
  console.log('Connecting to MongoDB...');
  connect(
    getBaseSettings().mongoURI,
    getBaseSettings().stagingEnv,
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
