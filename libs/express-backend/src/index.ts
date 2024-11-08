import { startExpress } from './api';

export * from './api/express';
export * from './config';
export * from './db/mongo';
export * from './utils';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');

export const startExpressServer = async <CB extends { [s: string]: string }>(
  apiRouter = Router(),
  preMiddlewares: Function[] = [],
  postMiddlewares: Function[] = [],
  disableCors: boolean = false,
  dontListen: boolean = false,
) => {
  console.log('Starting express server MongoDB...');
  return startExpress<CB>(
    apiRouter,
    preMiddlewares,
    postMiddlewares,
    disableCors,
    dontListen,
  ).catch((e) => console.log(e));
};
