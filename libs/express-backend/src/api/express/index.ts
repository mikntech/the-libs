export * from './middlewares';
export * from './routes';

import { getExpressSettings } from '../../config';

import type { Express, RequestHandler, Router } from 'express';
import { autoHelper, serverErrorHandler } from './middlewares';
import { StagingEnvironment, TODO } from '@the-libs/base-shared';
import { errorLog } from '../../db/mongo';

import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { mongoSettings } from '@the-libs/mongo-backend';

const require = createRequire(import.meta.url);
const { json, urlencoded } = require('express');

const cors = require('cors');
const cookieParser = require('cookie-parser');

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
  disableCors = false,
  dontListen = false,
  extraCorsOrigins: string[] = [],
  dontLogToMongo = false,
  timeoutInMS?: number,
) => {
  console.log('Starting Server...');
  const { port, clientDomains } = getExpressSettings<CB>();

  const origin = disableCors
    ? '*'
    : [...Object.values(clientDomains), ...extraCorsOrigins];
  console.log('cors origin: ', origin);
  const defaultPreMiddlewares = [
    cookieParser(),
    json({ limit: '50mb' }),
    urlencoded({ limit: '50mb', extended: true }),
    cors({
      origin: origin.length === 1 ? origin[0] : origin,
      credentials: true,
    }),
  ];

  const defaultPostMiddlewares = [
    serverErrorHandler(
      mongoSettings.stagingEnv,
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
        'Staging Environment': mongoSettings.stagingEnv,
        message: 'call "/api" to start',
      });

    expressApp.get('/', statusEndpointHandler);

    expressApp.use('/api', apiRouter);

    if (mongoSettings.stagingEnv !== StagingEnvironment.Prod)
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
    if (timeoutInMS) expressApp.use(timeout(timeoutInMS) as RequestHandler);
    return { app: expressApp, httpServer };
  } catch (e) {
    throw new Error('Express setup failed: ' + JSON.stringify(e));
  }
};
