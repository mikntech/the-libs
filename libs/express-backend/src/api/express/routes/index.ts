import type { Request, Response, NextFunction, CookieOptions } from 'express';
import { ServerResponse } from 'http';
import { NotLoggedInError } from '@the-libs/base-shared';
import { User } from '@the-libs/auth-shared';
import { createDoc } from '@the-libs/mongo-backend';
import { performanceLog } from '../../../db/mongo/schemas/logs/performanceLog';

export interface AuthenticatedRequest<
  UserType = string,
  UserI extends User = User,
> extends Request {
  user: UserI | null;
  userType: UserType;
  dontAuth?: boolean;
}

interface FullAPIResponse {
  statusCode: number;
  body?: object | string | number;
  cookie?: { name: string; val: string; options: CookieOptions };
}
type SimpleAPIResponse = [
  Pick<FullAPIResponse, 'statusCode'>,
  Pick<FullAPIResponse, 'body'>,
  Pick<FullAPIResponse, 'cookie'>,
];
type APIResponse = FullAPIResponse | SimpleAPIResponse;

type DefaultHandlerType<R> =
  | ((req: R) => Promise<APIResponse>)
  | ((req: R) => APIResponse)
  | ((req: R, write: ServerResponse['write']) => Promise<void>);

interface HighOrderHandlerParams<R> {
  handler: DefaultHandlerType<R>;
  wsHeaders?: {
    path: string;
    stat: string;
  }[];
  validateAuth?: boolean;
}

interface MonitoredReq {
  uid: { uid: string; time: number };
}

const logPerformance = (req: AuthenticatedRequest & MonitoredReq) =>
  performanceLog().then((model) =>
    createDoc(model, {
      stringifiedLog: JSON.stringify({
        uid: req.uid.uid,
        start: req.uid.time,
        end: performance.now(),
        originalUrl: req.originalUrl,
        user: JSON.stringify(req.user),
        body: req.body,
      }),
    }),
  );

export const highOrderHandler =
  <R = AuthenticatedRequest>(
    params: HighOrderHandlerParams<R> | DefaultHandlerType<R>,
  ) =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { wsHeaders, validateAuth } = params as HighOrderHandlerParams<R>;
    let { handler } = params as HighOrderHandlerParams<R>;
    if (!handler) handler = params as DefaultHandlerType<R>;
    try {
      if (wsHeaders) {
        wsHeaders.forEach(({ path, stat }) => res.setHeader(path, stat));
        await handler(req as R, res.write.bind(res));
      } else {
        if ((validateAuth ?? true) && !req.dontAuth && !req.user)
          return next(new NotLoggedInError());
        const restResponse = await (
          handler as (req: R) => Promise<APIResponse>
        )(req as R);
        let { statusCode, body, cookie } = restResponse as FullAPIResponse;
        if (Array.isArray(restResponse)) {
          [statusCode, body, cookie] = restResponse as unknown as [
            number,
            object | string | number,
            { name: string; val: string; options: CookieOptions },
          ];
        }
        if (statusCode >= 500) return next(new Error('Internal Server Error'));
        const ret = res.status(statusCode);
        if (cookie) {
          const { name, val, options } = cookie;
          ret.cookie(name, val, options);
        }
        if (typeof body === 'string') {
          if ((req as AuthenticatedRequest & MonitoredReq).uid)
            logPerformance(req as AuthenticatedRequest & MonitoredReq).catch(
              (e) => console.error(e),
            );
          ret.send(body);
        } else {
          if ((req as AuthenticatedRequest & MonitoredReq).uid)
            logPerformance(req as AuthenticatedRequest & MonitoredReq).catch(
              (e) => console.error(e),
            );
          ret.json(body);
        }
      }
    } catch (err) {
      next(err);
    }
  };
