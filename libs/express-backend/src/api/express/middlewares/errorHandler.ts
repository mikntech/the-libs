import type {
  NextFunction,
  Request as ExpressRequest,
  Response,
} from 'express';
import { StagingEnvironment } from '../../../config';
import { ClientError, ErrorLog, TODO } from '@the-libs/base-shared';
import { errorLog } from '../../../db/mongo';

import type { Document as MDocument } from 'mongoose';
import { createDoc, ExtendedModel } from '@the-libs/mongo-backend';

export const serverErrorHandler =
  <
    DocI extends {
      stringifiedError: string;
    } & MDocument<any, any, any> = ErrorLog,
    SE = StagingEnvironment,
  >(
    stagingEnv: SE,
    errorLogModel: () => Promise<ExtendedModel<DocI>> = async () =>
      (await errorLog()) as TODO,
    dontLogToMongo: boolean = false,
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
        !dontLogToMongo &&
          (await createDoc(await errorLogModel(), {
            stringifiedError: err.toString(),
          } as Partial<DocI>));
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
