import { NextFunction, Request as ExpressRequest, Response } from "express";
import { Model } from "mongoose";
import { StagingEnvironment } from "../../../config";
import { ClientError, ErrorLog, errorLog, TODO } from "base-shared";

export const serverErrorHandler =
  <SCHEMA = ErrorLog, SE = StagingEnvironment>(
    stagingEnv: SE,
    errorLogModel: Model<SCHEMA> = errorLog() as unknown as Model<SCHEMA>,
  ) =>
  async (
    err: Error,
    _: ExpressRequest,
    res: Response,
    next: NextFunction,
  ): Promise<TODO> => {
    if (err) {
      if (err instanceof ClientError)
        return res.status(err.statusCode).send(err);
      try {
        await new errorLogModel({
          stringifiedError: err.toString(),
        }).save();
        console.log("Error was logged to mongo");
        stagingEnv === "local" && console.log("the error: ", err);
      } catch (e) {
        console.log("Error logging error to mongo: ", e);
      }
      if (!res.headersSent) {
        return res.status(500).send("Server error");
      }
    } else {
      next(err);
    }
  };
