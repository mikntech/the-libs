import { createRequire } from 'module';
import { highOrderHandler } from '@the-libs/express-backend';
import { analyticEvent } from '../../db/mongo/analytics/analyticEvent';
import { SomeEnum } from '@the-libs/base-shared';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import type { Request } from 'express';
import { createDoc } from '@the-libs/mongo-backend';

export const analyticsRouterGenerator = <ENUM>(
  AnalyticEventEnum: SomeEnum<ENUM>,
) => {
  const analyticsRouter = Router();

  analyticsRouter.post(
    '/',
    highOrderHandler(async (req: Request) => {
      try {
        await createDoc(await analyticEvent<ENUM>(AnalyticEventEnum), {
          value: req.body.value,
          userNumber: req.body.userNumber,
        });
      } catch (e) {
        console.log(e);
      }
      return { statusCode: 201, body: 'got it' };
    }),
  );

  return analyticsRouter;
};
