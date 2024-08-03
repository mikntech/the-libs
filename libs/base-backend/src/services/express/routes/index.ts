import { Request, Response, NextFunction, CookieOptions } from "express";
import { ServerResponse } from "http";
import { TODO } from "base-shared";

interface APIResponse {
  statusCode: number;
  body?: {} | string;
  cookie?: { name: string; val: string; options: CookieOptions };
}

export const highOrderHandler =
  <R extends Request>(
    handler:
      | ((req: R) => Promise<APIResponse>)
      | ((req: R) => APIResponse)
      | ((req: R, write: ServerResponse["write"]) => Promise<void>),
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
        const { statusCode, body, cookie } = restResponse;
        if (statusCode >= 500) next(new Error("Internal Server Error"));
        const ret = res.status(statusCode);
        if (cookie) {
          const { name, val, options } = cookie;
          ret.cookie(name, val, options);
        }
        typeof body === "string" || body === undefined
          ? ret.send(body)
          : ret.json(body);
      }
    } catch (err) {
      next(err);
    }
  };
