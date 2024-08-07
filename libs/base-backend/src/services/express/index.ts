export * from './middlewares';
export * from './routes';

import { getBaseSettings } from '../../config';
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
import { json, Router, urlencoded } from 'express';
import { autoHelper, serverErrorHandler } from './middlewares';
import { errorLog, TODO } from '@base-shared';

const { version: Version } = require(
  path.join(__dirname, '..', '..', '..', 'package.json'),
);
const express = require('express');

const app = express();

export const setup = async <CB extends { [s: string]: string }>(
  apiRouter: Router,
  preMiddlewares: Function[] = [],
  postMiddlewares: Function[] = [],
) => {
  console.log('Starting Server...');

  const { port, clientDomains, stagingEnv } = getBaseSettings<CB>();

  const defaultPreMiddlewares = [
    cookieParser(),
    json({ limit: '50mb' }),
    urlencoded({ limit: '50mb', extended: true }),
    cors({
      origin: Object.values(clientDomains),
      credentials: true,
    }),
  ];

  const defaultPostMiddlewares = [
    serverErrorHandler(getBaseSettings().stagingEnv, errorLog()),
  ];

  try {
    [...defaultPreMiddlewares, ...preMiddlewares].forEach((middleware: TODO) =>
      app.use(middleware),
    );

    const statusEndpointHandler = (_: TODO, res: TODO) =>
      res.status(200).json({
        'Health Check Status': 'Im alive',
        Version,
        'Staging Environment': stagingEnv,
        message: 'call "/api" to start',
      });

    app.get('/', statusEndpointHandler);

    app.use('/api', apiRouter);

    getBaseSettings().stagingEnv !== 'prod' && app.use(autoHelper);

    [...defaultPostMiddlewares, ...postMiddlewares].forEach(
      (middleware: TODO) => app.use(middleware),
    );

    app.listen(port, '0.0.0.0', () => {
      console.log('Server is ready at ' + getBaseSettings().myDomain);
    });
  } catch (e) {
    throw new Error('Express setup failed: ' + JSON.stringify(e));
  }
};
