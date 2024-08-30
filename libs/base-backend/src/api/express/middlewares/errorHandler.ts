import { NextFunction, Request as ExpressRequest, Response } from 'express';
import { StagingEnvironment } from '../../../config';
import { ClientError, ErrorLog, TODO } from '@the-libs/base-shared';
import { errorLog } from '../../../db/mongo';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { Model } = require('mongoose');

export const serverErrorHandler =
  <DocI = ErrorLog, SE = StagingEnvironment>(
    stagingEnv: SE,
    errorLogModel: Model<DocI> = errorLog() as unknown as Model<DocI>,
  ) =>
  async (
    err: Error,
    _: ExpressRequest,
    res: Response,
    next: NextFunction,
  ): Promise<TODO> => {
    if (err) {
      if (err instanceof ClientError)
        return res.status(err.statusCode).send(err.message || String(err));
      try {
        await new errorLogModel({
          stringifiedError: err.toString(),
        }).save();
        console.log('Error was logged to mongo');
        stagingEnv === 'local' && console.log('the error: ', err);
      } catch (e) {
        console.log('Error logging error to mongo: ', e);
      }
      if (!res.headersSent) {
        return res.status(500).send('Server error');
      }
    } else {
      next(err);
    }
  };
