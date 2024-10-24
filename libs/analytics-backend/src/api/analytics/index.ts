import { createRequire } from 'module';
import { highOrderHandler } from '@the-libs/express-backend';
import { analyticEvent } from '../../db/mongo/analytics/analyticEvent';
import { SomeEnum } from '@the-libs/base-shared';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import type { Request } from 'express';

export const analyticsRouterGenerator = <ENUM>(
  AnalyticEventEnum: SomeEnum<ENUM>,
) => {
  const analyticsRouter = Router();

  analyticsRouter.post(
    '/',
    highOrderHandler(async (req: Request) => {
      try {
        const avent = new (await analyticEvent<ENUM>(AnalyticEventEnum))({
          value: req.body.value,
          userPhone: req.body.userPhone,
        });
        await avent.save();
      } catch (e) {
        console.log(e);
      }
      return { statusCode: 201, body: 'got it' };
    }),
  );

  return analyticsRouter;
};
