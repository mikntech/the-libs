
export * from './middlewares';
export * from './routes';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { json, Router, urlencoded } from 'express';
import { join } from 'path';
import { autoHelper, serverErrorHandler } from './middlewares';
import { TODO } from '../../types';
import { settings } from 'base-backend';

const { version: Version } = require(
  join(__dirname, '..', '..', '..', 'package.json'),
);

const app = express();
const { port, clientDomain, stagingEnv } = settings;

const defaultMiddlewares = [
  cookieParser(),
  json({ limit: '50mb' }),
  urlencoded({ limit: '50mb', extended: true }),
  cors({
    origin: [clientDomain],
    credentials: true,
  }),
  serverErrorHandler,
];

export const setup= async (apiRouter: Router, middlewares=[]) => {
  console.log('Starting Server...');
  try {
    [...defaultMiddlewares, ...middlewares].forEach((middleware:TODO) => app.use(middleware));

    const statusEndpointHandler = (_: TODO, res: TODO) => {
      res.status(200).json({
        'Health Check Status': 'Im alive',
        Version,
        'Staging Environment': stagingEnv,
        message: 'call "/api" to start',
      });
    };

    app.get('/', statusEndpointHandler);

    app.use('/api', apiRouter);

    settings.stagingEnv !== 'prod' && app.use(autoHelper);

    app.listen(port, '0.0.0.0', () => {
      console.log('Server is ready at ' + settings.myDomain);
    });
  } catch (e) {
    throw new Error('Express setup failed: ' + JSON.stringify(e));
  }
};
