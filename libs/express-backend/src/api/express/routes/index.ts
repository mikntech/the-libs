import type { Request, Response, NextFunction, CookieOptions } from 'express';
import { ServerResponse } from 'http';
import { NotLoggedInError, TODO } from '@the-libs/base-shared';

interface APIResponse {
  statusCode: number;
  body?: object | string | number;
  cookie?: { name: string; val: string; options: CookieOptions };
}

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

export const highOrderHandler =
  <R extends Request>(
    params: HighOrderHandlerParams<R> | DefaultHandlerType<R>,
  ) =>
  async (req: R & { user?: TODO }, res: Response, next: NextFunction) => {
    const { wsHeaders, validateAuth } = params as HighOrderHandlerParams<R>;
    let { handler } = params as HighOrderHandlerParams<R>;
    if (!handler) handler = params as DefaultHandlerType<R>;
    try {
      if (wsHeaders) {
        wsHeaders.forEach(({ path, stat }) => res.setHeader(path, stat));
        await handler(req, res.write.bind(res));
      } else {
        if ((validateAuth ?? true) && !req.user)
          return next(new NotLoggedInError());
        const restResponse = await (
          handler as (req: R) => Promise<APIResponse>
        )(req);
        const { statusCode, body, cookie } = restResponse;
        if (statusCode >= 500) return next(new Error('Internal Server Error'));
        const ret = res.status(statusCode);
        if (cookie) {
          const { name, val, options } = cookie;
          ret.cookie(name, val, options);
        }
        if (typeof body === 'string') {
          ret.send(body);
        } else {
          ret.json(body);
        }
      }
    } catch (err) {
      next(err);
    }
  };
