import { Response, NextFunction, CookieOptions } from 'express';
import { AuthenticatedRequest } from 'auth-b';

interface APIResponse {
  code: number;
  body?: {} | string;
  cookie?: { name: string; val: string; options: CookieOptions };
}

type Write = (
  chunk: any,
  callback?: (error: Error | null | undefined) => void
) => boolean;

type RESTHandler = (req: AuthenticatedRequest) => Promise<APIResponse>;
type WSHandler = (req: AuthenticatedRequest, write: Write) => Promise<void>;

interface WSHeaders {
  path: string;
  stat: string;
}

type HighOrderHandler = {
  (handler: RESTHandler, wsHeaders?: undefined): (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => void;
  (handler: WSHandler, wsHeaders: WSHeaders[]): (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => void;
};

export const highOrderHandler =
  <T extends AuthenticatedRequest>(
    handler: (req: T) => Promise<APIResponse>,
    wsHeaders?: WSHeaders[]
  ) =>
  (req: T, res: Response, next: NextFunction) => {
    handler(req)
      .then((response) => {
        const { code, body, cookie } = response;
        if (cookie) {
          res.cookie(cookie.name, cookie.val, cookie.options);
        }
        res.status(code);
        body ? res.json(body) : res.end();
      })
      .catch(next);
  };
