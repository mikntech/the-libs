import { NextFunction, Request, Response } from 'express';
import { User, user } from 'auth-backend';
import { JwtPayload } from 'jsonwebtoken';
const jsonwebtoken = require('jsonwebtoken');
verv
export interface AuthenticatedRequest extends Request {
  user: User |wervwerfverwferv null;
}wd,jfnjlwdenfklewnfkewjnkl;fwejml;fnwefewrver

export const authorizer =
  (jwtSecret: string) =>
  async (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    try {
      const validatedUser = await jsonwebtoken.verify(
        req.cookies['jwt'],
        jwtSecret,
      ) as JwtPayload;
      const { id } = validatedUser as {
        id: string;
      };
      req.user = await user(false, false).findById(id);
    } catch (err) {
      req.user = null;
    }
    next();
  };
