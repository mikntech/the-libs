import { Request, Response, NextFunction, CookieOptions } from 'express';
import { ServerResponse } from 'http';
import { TODO } from '../../../types';

interface APIResponse {
  code: number;
  body?: {} | string;
  cookie?: { name: string; val: string; options: CookieOptions };
}

export const highOrderHandler =
  <R extends Request>(
    handler:
      | ((req: R) => Promise<APIResponse>)
      | ((req: R, write: ServerResponse['write']) => Promise<void>),
    wsHeaders?: {
      path: string;
      stat: string;
    }[],
  ) =>
  async (req: R, res: Response, next: NextFunction) => {
    try {
      if (wsHeaders) {
        wsHeaders.forEach(({ path, stat }) => res.setHeader(path, stat));
        await handler(req, res.write as TODO);
      } else {
        const restResponse = await (
          handler as (req: R) => Promise<APIResponse>
        )(req);
        const { code, body, cookie } = restResponse;
        if (code >= 500) next(new Error('Internal Server Error'));
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
