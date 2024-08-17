export * from './config';
export * from './controllers';
export * from './schemas';
export * from './services';
export * from './watch';

import { setup } from './services';
import { Router } from 'express';
import { getBaseSettings } from './config';
import { connect } from './schemas';

export const start = <CB extends { [s: string]: string }>(
  apiRouter = Router(),
  preMiddlewares: Function[] = [],
  postMiddlewares: Function[] = [],
  logMongoToConsole: boolean = true,
) => {
  console.log('Connecting to MongoDB...');
  connect(
    getBaseSettings().mongoURI,
    getBaseSettings().stagingEnv,
    logMongoToConsole,
  )
    .then(() =>
      setup<CB>(apiRouter, preMiddlewares, postMiddlewares).catch((e) =>
        console.log(e),
      ),
    )
    .catch((e) => console.log(e));
};
