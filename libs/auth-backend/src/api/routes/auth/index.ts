import { Router } from "express";
import { logRouter } from "./logRouter";
import { manageRouter } from "./manageRouter";
import { registerRouter } from "./registerRouter";
import { Strategy } from "../../../strategy";
import { highOrderHandler, SomeEnum } from "base-backend";
import { genAuthControllers } from "../../../controllers";

export const authRouter = <
  UserTypeEnum extends SomeEnum<UserTypeEnum>,
  RequiredFields extends {},
  OptionalFields extends {},
>(
  strategy: Strategy<
    RequiredFields,
    OptionalFields,
    UserTypeEnum,
    boolean,
    boolean
  >,
) => {
  const router = Router();

  router.use("/log", logRouter(strategy));
  router.use("/manage", manageRouter(strategy));
  router.use("/register", registerRouter(strategy));

  router.get(
    "/ZXCVBNDifficulty",
    highOrderHandler(() => ({
      statusCode: 200,
      body: strategy.MIN_PASSWORD_STRENGTH,
    })),
  );

  return router;
};
