export * from './middlewares';
export * from './routes';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { json, Router, urlencoded } from 'express';
import settings from '../config';
import { join } from 'path';
import { autoHelper, serverErrorHandler } from './middlewares';
import { TODO } from '../types';

const { version: Version } = require(
  join(__dirname, '..', '..', '..', 'package.json'),
);

const app = express();
const { port, clientDomain, stagingEnv } = settings;

const middlewares = [
  cookieParser(),
  json({ limit: '50mb' }),
  urlencoded({ limit: '50mb', extended: true }),
  cors({
    origin: [clientDomain],
    credentials: true,
  }),
];

export default async (router: Router) => {
  console.log('Starting Server...');
  try {
    middlewares.forEach((middleware) => app.use(middleware));

    const statusEndpointHandler = (_: TODO, res: TODO) => {
      res.status(200).json({
        'Health Check Status': 'Im alive',
        Version,
        'Staging Environment': stagingEnv,
        message: 'call "/api" to start',
      });
    };

    app.get('/', statusEndpointHandler);

    app.use('/api', router);

    settings.stagingEnv !== 'prod' && app.use(autoHelper);

    app.use(serverErrorHandler);

    app.listen(port, '0.0.0.0', () => {
      console.log('Server is ready at ' + settings.myDomain);
    });
  } catch (e) {
    throw new Error('Express setup failed: ' + JSON.stringify(e));
  }
};
