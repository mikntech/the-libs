import { NextFunction, Request, Response } from "express";
import { authSettings, User, user } from "auth-backend";
import { JwtPayload } from "jsonwebtoken";
import { ObjectId } from "mongoose";
const jsonwebtoken = require("jsonwebtoken");

export interface AuthenticatedRequest extends Request {
  user: User | null;
}

export const authorizer = async (
  req: AuthenticatedRequest,
  _: Response,
  next: NextFunction,
) => {
  try {
    const validatedUser = (await jsonwebtoken.verify(
      req.cookies["jwt"],
      authSettings.jwtSecret,
    )) as JwtPayload;
    const { _id } = validatedUser as {
      _id: ObjectId;
    };
    req.user = await user(false, false, false).findById(String(_id));
  } catch (err) {
    req.user = null;
  }
  next();
};
