import { Router } from "express";
import { AuthenticatedRequest, MultiUserType, Strategy } from "auth-backend";
import { genRegisterControllers } from "../../../controllers/auth/register";
import { highOrderHandler } from "base-backend";
import { SomeEnum, TODO } from "base-shared";

export const registerRouter = <
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

  const { requestToRegister, finishRegistration } =
    genRegisterControllers(strategy);
  router.post(
    "/request" +
      (strategy.multiUserType === MultiUserType.SINGLE ? "" : "/:userType"),
    highOrderHandler(async (req: AuthenticatedRequest) => {
      const { email } = req.body;
      const userType = req.params["userType"] as unknown as UserTypeEnum;
      return requestToRegister(email, userType, strategy.genRegisterEmail);
    }) as TODO,
  );

  router.post(
    "/finish",
    highOrderHandler(async (req: AuthenticatedRequest) => {
      const { key, full_name, password, passwordAgain, requiredFields } =
        req.body;
      return finishRegistration(
        key,
        full_name,
        password,
        passwordAgain,
        requiredFields,
      );
    }) as TODO,
  );

  return router;
};
