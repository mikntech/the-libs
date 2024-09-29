import { startExpress } from './api';

export * from './api/express';
export * from './config';
export * from './db/mongo';
export * from './utils';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');

export const startExpressServer = <CB extends { [s: string]: string }>(
  apiRouter = Router(),
  preMiddlewares: Function[] = [],
  postMiddlewares: Function[] = [],
  disableCors: boolean = false,
) => {
  console.log('Starting express server MongoDB...');
  startExpress<CB>(
    apiRouter,
    preMiddlewares,
    postMiddlewares,
    disableCors,
  ).catch((e) => console.log(e));
};
