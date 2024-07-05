import { Response, NextFunction } from 'express';
import { CookieOptions } from 'express-serve-static-core';
import { AuthenticatedRequest } from 'auth-b';

export interface APIResponse {
  code: number;
  body?: {} | string;
  cookie?: { name: string; val: string; options: CookieOptions };
}

export type Write = (
  chunk: any,
  callback?: (error: Error | null | undefined) => void,
) => boolean;

type RESTHandler = (req: AuthenticatedRequest) => Promise<APIResponse>;
type WSHandler = (req: AuthenticatedRequest, write: Write) => Promise<void>;

interface WSHeaders {
  path: string;
  stat: string;
}

function highOrderHandler(
  handler: RESTHandler,
  wsHeaders?: undefined,
): (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => Promise<void>;

function highOrderHandler(
  handler: WSHandler,
  wsHeaders: WSHeaders[],
): (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => Promise<void>;

function highOrderHandler(
  handler: RESTHandler | WSHandler,
  wsHeaders?: WSHeaders[],
) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (wsHeaders) {
        wsHeaders.forEach(({ path, stat }) => res.setHeader(path, stat));
        await handler(req, res.write as any);
        return;
      } else {
        const restResponse: APIResponse = await (handler as RESTHandler)(req);
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
}

export default highOrderHandler;
