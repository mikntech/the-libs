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
  preMiddlewares: (Function | { route: string; func: Function })[] = [],
  postMiddlewares: (Function | { route: string; func: Function })[] = [],
  disableCors: boolean = false,
  dontListen: boolean = false,
  extraCorsOrigins: string[] = [],
  dontLogToMongo: boolean = false,
) => {
  console.log('Starting express server MongoDB...');
  return startExpress<CB>(
    apiRouter,
    preMiddlewares,
    postMiddlewares,
    disableCors,
    dontListen,
    extraCorsOrigins,
    dontLogToMongo,
  ).catch((e) => console.log(e));
};
