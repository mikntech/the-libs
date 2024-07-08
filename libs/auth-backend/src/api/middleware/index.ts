import { NextFunction, Request, Response } from 'express';
import { User, user } from 'auth-backend';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user: User | null;
}

export const authorizer =
  (jwtSecret: string) =>
  async (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    try {
      const validatedUser = jsonwebtoken.verify(
        req.cookies['jwt'],
        jwtSecret
      ) as JwtPayload;
      const { id } = validatedUser as {
        id: string;
      };
      req.user = await user(false, false) .findById(id);
    } catch (err) {
      req.user = null;
    }
    next();
  };
