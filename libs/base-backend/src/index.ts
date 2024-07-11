export * from "./config";
export * from "./controllers";
export * from "./exceptions";
export * from "./schemas";
export * from "./services";
export * from "./types";

import { setup } from "./services";
import { connect } from "./schemas";
import { Router } from "express";
import { getBaseSettings } from "./config";

export const start = <CB extends { [s: string]: string }>(
  apiRouter = Router(),
  middlewares: Function[] = [],
  watchDB = () => {},
) => {
  console.log("Connecting to MongoDB...");
  connect(getBaseSettings().mongoURI, getBaseSettings().stagingEnv, watchDB)
    .then(() => setup<CB>(apiRouter, middlewares).catch((e) => console.log(e)))
    .catch((e) => console.log(e));
};
