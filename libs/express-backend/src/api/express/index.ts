export * from './middlewares';
export * from './routes';

import { getExpressSettings } from '../../config';

import type { Router, Express, RequestHandler } from 'express';
import { autoHelper, serverErrorHandler } from './middlewares';
import { TODO } from '@the-libs/base-shared';
import { errorLog } from '../../db/mongo';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { json, urlencoded } = require('express');

const cors = require('cors');
const cookieParser = require('cookie-parser');

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

// Get the current directory equivalent to `__dirname`
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Construct the path to the package.json file
const packageJsonPath = join(__dirname, '..', '..', '..', 'package.json');

// Read and parse the package.json file
const { version: Version } = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

const express = require('express');

const timeout = require('connect-timeout');

export const expressApp: Express = express();

export const startExpress = async <CB extends { [s: string]: string }>(
  apiRouter: Router,
  preMiddlewares: (Function | { route: string; func: Function })[] = [],
  postMiddlewares: (Function | { route: string; func: Function })[] = [],
  disableCors: boolean = false,
  dontListen: boolean = false,
  extraCorsOrigins: string[] = [],
  dontLogToMongo: boolean = false,
  timeoutInMS?: number,
) => {
  console.log('Starting Server...');
  const { port, clientDomains, stagingEnv } = getExpressSettings<CB>();

  const origin = disableCors
    ? '*'
    : [...Object.values(clientDomains), ...extraCorsOrigins];
  console.log('cors origin: ', origin);
  expressApp.set('trust proxy', true);

  const defaultPreMiddlewares = [
    cookieParser(),
    json({ limit: '50mb' }),
    urlencoded({ limit: '50mb', extended: true }),
    cors({
      origin,
      credentials: true,
    }),
  ];

  const defaultPostMiddlewares = [
    serverErrorHandler(
      getExpressSettings().stagingEnv,
      async () => errorLog(),
      dontLogToMongo,
    ),
  ];

  try {
    [...defaultPreMiddlewares, ...preMiddlewares].forEach((middleware: TODO) =>
      middleware?.route
        ? expressApp.use(middleware.route, middleware.func)
        : expressApp.use(middleware),
    );

    const statusEndpointHandler = (_: TODO, res: TODO) =>
      res.status(200).json({
        'Health Check Status': 'Im alive',
        Version,
        'Staging Environment': stagingEnv,
        message: 'call "/api" to start',
      });

    expressApp.get('/', statusEndpointHandler);

    expressApp.use('/api', apiRouter);

    getExpressSettings().stagingEnv !== 'prod' &&
      expressApp.use('/api', autoHelper);

    [...defaultPostMiddlewares, ...postMiddlewares].forEach(
      (middleware: TODO) =>
        middleware?.route
          ? expressApp.use(middleware.route, middleware.func)
          : expressApp.use(middleware),
    );

    const httpServer =
      !dontListen &&
      expressApp.listen(port, '0.0.0.0', () => {
        console.log('Server is ready at ' + getExpressSettings().myDomain);
      });
    timeoutInMS && expressApp.use(timeout(timeoutInMS) as RequestHandler);
    return { app: expressApp, httpServer };
  } catch (e) {
    throw new Error('Express setup failed: ' + JSON.stringify(e));
  }
};
