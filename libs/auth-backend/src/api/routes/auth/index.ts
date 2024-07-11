import { Router } from "express";
import logRouter from "./logRouter";
import registerRouter from "./registerRouter";
import manageRouter from "./manageRouter";

export const authRouter = Router();

authRouter.use("/log", logRouter);
authRouter.use("/manage", manageRouter);
authRouter.use("/register", registerRouter);
