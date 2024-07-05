import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import router from './routes/apiRouter';
import settings from '../config';
import path from 'path';
import { autoDocer, serverErrorHandler } from './middleware';
import { TODO } from '@cube-box/shared';

const { version: Version } = require(
  path.join(__dirname, '..', '..', '..', 'package.json'),
);

const app = express();
const { port, clientDomain, stagingEnv } = settings;

const middlewares = [
  cookieParser(),
  express.json({ limit: '50mb' }),
  express.urlencoded({ limit: '50mb', extended: true }),
  cors({
    origin: [clientDomain],
    credentials: true,
  }),
];

export default async () => {
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

    settings.stagingEnv !== 'prod' && app.use(autoDocer);

    app.use(serverErrorHandler);

    app.listen(port, '0.0.0.0', () => {
      const prefix = stagingEnv === 'preprod' ? 'pre' : '';
      console.log(
        'Server is ready at http' +
          (stagingEnv === 'local'
            ? '://localhost:' + port + '/'
            : 's://' + prefix + 'server.offisito.com/'),
      );
    });
  } catch (e) {
    throw new Error('Express setup failed: ' + JSON.stringify(e));
  }
};
