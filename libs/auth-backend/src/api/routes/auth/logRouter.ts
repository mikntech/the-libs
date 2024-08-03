import { AuthenticatedRequest, Strategy } from "auth-backend";
import { Router } from "express";
import { highOrderHandler } from "base-backend";
import { SomeEnum, TODO } from "base-shared";
import { genLogControllers } from "../../../controllers/auth/log";

export const logRouter = <
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

  const { validateAndProtect, logIn, logOut } = genLogControllers(strategy);

  router.get(
    "/",
    highOrderHandler((async (req: AuthenticatedRequest) => ({
      statusCode: 200,
      body: validateAndProtect(req.user as TODO),
    })) as TODO),
  );

  router.post(
    "/in",
    highOrderHandler((async (req: AuthenticatedRequest) => {
      const { email, password, userType } = req.body;
      return logIn(email, password, userType);
    }) as TODO),
  );

  router.get(
    "/out",
    highOrderHandler(((_: AuthenticatedRequest) => logOut()) as TODO),
  );

  return router;
};
