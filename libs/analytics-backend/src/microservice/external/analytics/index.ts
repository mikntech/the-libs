import { startExpressServer } from '@the-libs/express-backend';
import { createRequire } from 'module';
import { SomeEnum } from '@the-libs/base-shared';
import { analyticsRouterGenerator } from '../../../';

const require = createRequire(import.meta.url);

const { Router } = require('express');

export const startExternalAnalyticsMicroservice = <ENUM>(
  AnalyticEventEnum: SomeEnum<ENUM>,
  preMiddlewares: (Function | { route: string; func: Function })[] = [],
  postMiddlewares: (Function | { route: string; func: Function })[] = [],
  disableCors: boolean = false,
  dontListen: boolean = false,
  extraCorsOrigins: string[] = [],
  dontLogToMongo: boolean = false,
  timeout?: number,
) =>
  startExpressServer(
    Router().use(
      'analytics',
      analyticsRouterGenerator<ENUM>(AnalyticEventEnum),
    ),
    preMiddlewares,
    postMiddlewares,
    disableCors,
    dontListen,
    extraCorsOrigins,
    dontLogToMongo,
    timeout,
  );
