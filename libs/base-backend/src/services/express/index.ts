export * from "./middlewares";
export * from "./routes";

import { getBaseSettings } from "../../config";
import cors from "cors";
import cookieParser from "cookie-parser";
import express, { json, Router, urlencoded } from "express";
import { join } from "path";
import { autoHelper, serverErrorHandler } from "./middlewares";
import { TODO } from "../../types";
import { errorLog } from "../../schemas/logs/errorLog";

const { version: Version } = require(
  join(__dirname, "..", "..", "..", "package.json"),
);

const app = express();

export const setup = async <CB extends { [s: string]: string }>(
  apiRouter: Router,
  middlewares: Function[] = [],
) => {
  console.log("Starting Server...");

  const { port, clientDomains, stagingEnv } = getBaseSettings<CB>();

  const defaultMiddlewares = [
    cookieParser(),
    json({ limit: "50mb" }),
    urlencoded({ limit: "50mb", extended: true }),
    cors({
      origin: Object.values(clientDomains),
      credentials: true,
    }),
    serverErrorHandler(getBaseSettings().stagingEnv, errorLog()),
  ];

  try {
    [...defaultMiddlewares, ...middlewares].forEach((middleware: TODO) =>
      app.use(middleware),
    );

    const statusEndpointHandler = (_: TODO, res: TODO) =>
      res.status(200).json({
        "Health Check Status": "Im alive",
        Version,
        "Staging Environment": stagingEnv,
        message: 'call "/api" to start',
      });

    app.get("/", statusEndpointHandler);

    app.use("/api", apiRouter);

    getBaseSettings().stagingEnv !== "prod" && app.use(autoHelper);

    app.listen(port, "0.0.0.0", () => {
      console.log("Server is ready at " + getBaseSettings().myDomain);
    });
  } catch (e) {
    throw new Error("Express setup failed: " + JSON.stringify(e));
  }
};
