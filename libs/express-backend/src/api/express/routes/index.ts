import type { Request, Response, NextFunction, CookieOptions } from 'express';
import { ServerResponse } from 'http';
import { NotLoggedInError } from '@the-libs/base-shared';
import { User } from '@the-libs/auth-shared';

export interface AuthenticatedRequest<
  UserType = string,
  UserI extends User = User,
> extends Request {
  user: UserI | null;
  userType: UserType;
  dontAuth?: boolean;
}

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
