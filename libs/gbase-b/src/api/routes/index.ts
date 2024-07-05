import { Response, NextFunction, CookieOptions } from 'express';
import { AuthenticatedRequest } from 'auth-b';
import { ServerResponse } from 'http';

interface APIResponse {
  code: number;
  body?: {} | string;
  cookie?: { name: string; val: string; options: CookieOptions };
}

export const highOrderHandler =
  (
    handler:
      | ((req: AuthenticatedRequest) => Promise<APIResponse>)
      | ((
          req: AuthenticatedRequest,
          write: ServerResponse['write'],
        ) => Promise<void>),
    wsHeaders?: {
      path: string;
      stat: string;
    }[],
  ) =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (wsHeaders) {
        wsHeaders.forEach(({ path, stat }) => res.setHeader(path, stat));
        await handler(req, res.write as any);
      } else {
        const restResponse = await (
          handler as (req: AuthenticatedRequest) => Promise<APIResponse>
        )(req);
        const { code, body, cookie } = restResponse;
        if (code >= 500) throw new Error('Internal Server Error');
        const ret = res.status(code);
        if (cookie) {
          const { name, val, options } = cookie;
          ret.cookie(name, val, options);
        }
        typeof body === 'string' || body === undefined
          ? ret.send(body)
          : ret.json(body);
      }
    } catch (err) {
      next(err);
    }
  };
