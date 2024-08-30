export * from './middlewares';
export * from './routes';

import { getBaseSettings } from '../../config';

import type { Router } from 'express';
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

export const expressApp = express();

export const startExpress = async <CB extends { [s: string]: string }>(
  apiRouter: Router,
  preMiddlewares: Function[] = [],
  postMiddlewares: Function[] = [],
  disableCors: boolean = false,
) => {
  console.log('Starting Server...');
  const { port, clientDomains, stagingEnv } = getBaseSettings<CB>();

  const defaultPreMiddlewares = [
    cookieParser(),
    json({ limit: '50mb' }),
    urlencoded({ limit: '50mb', extended: true }),
    cors({
      origin: disableCors ? '*' : Object.values(clientDomains),
      credentials: true,
    }),
  ];

  const defaultPostMiddlewares = [
    serverErrorHandler(getBaseSettings().stagingEnv, errorLog()),
  ];

  try {
    [...defaultPreMiddlewares, ...preMiddlewares].forEach((middleware: TODO) =>
      expressApp.use(middleware),
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

    getBaseSettings().stagingEnv !== 'prod' && expressApp.use(autoHelper);

    [...defaultPostMiddlewares, ...postMiddlewares].forEach(
      (middleware: TODO) => expressApp.use(middleware),
    );

    expressApp.listen(port, '0.0.0.0', () => {
      console.log('Server is ready at ' + getBaseSettings().myDomain);
    });
  } catch (e) {
    throw new Error('Express setup failed: ' + JSON.stringify(e));
  }
};
