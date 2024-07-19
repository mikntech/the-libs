import {
  findDocs,
  getBaseSettings,
  InvalidInputError,
  NodeEnvironment,
  SomeEnum,
  StagingEnvironment,
  validateDocument,
  TODO,
} from "base-backend";
import {
  MultiUserType,
  passResetRequest,
  registrationRequest,
  SomeRequest,
  Strategy,
  User,
  authSettings,
} from "auth-backend";
import { genSalt, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { CookieOptions } from "express";
const zxcvbn = require("zxcvbn");
import { Model } from "mongoose";
import { sendEmail } from "email-backend";

export const JWT_COOKIE_NAME = "jwt";

export const genAuthControllers = <
  UserType extends SomeEnum<UserType>,
  RequiredFields extends {},
  OptionalFields extends {},
>(
  strategy: Strategy<
    RequiredFields,
    OptionalFields,
    UserType,
    boolean,
    boolean
  >,
) => {
  const getModel = (userType: UserType): Model<User> =>
    (strategy.multiUserType === MultiUserType.MULTI_COLLECTION
      ? (strategy.modelMap as TODO)[userType]
      : strategy.modelMap)();

  const generateJWT = ({ _id }: User, userType: UserType) =>
    sign(
      {
        _id,
        userType,
      },
      authSettings.jwtSecret,
    );

  const generateSecureCookie = (name: string, val: string) => ({
    name,
    val,
    options: {
      httpOnly: true,
      sameSite:
        getBaseSettings().nodeEnv === NodeEnvironment.development
          ? "lax"
          : "none",
      secure: getBaseSettings().nodeEnv === NodeEnvironment.production,
    } as CookieOptions,
  });

  const sendEmailWithLink = (
    email: string,
    subject: string,
    body: string,
    link: string,
  ) => {
    sendEmail(email, subject, body).then(
      () =>
        getBaseSettings().stagingEnv === StagingEnvironment.local &&
        console.log("tried to send email - link is: " + link),
    );
  };

  const validatePasswordStrength = (password: string) => {
    if (zxcvbn(password).score < strategy.MIN_PASSWORD_STRENGTH)
      throw new InvalidInputError("Password is too weak");
  };

  const validateKey = async (key: string, register: boolean) => {
    const existingRequest = await findDocs<SomeRequest<true>, false>(
      (register ? registrationRequest() : passResetRequest()).findOne({
        key,
      }),
      true,
    );
    if (!existingRequest || !validateDocument(existingRequest as TODO)) {
      throw new InvalidInputError("key is wrong");
    }
    return existingRequest as SomeRequest<true>;
  };

  const hashPassword = async (newPassword: string) =>
    hash(newPassword, await genSalt());

  return {
    getModel,
    hashPassword,
    validateKey,
    validatePasswordStrength,
    sendEmailWithLink,
    generateSecureCookie,
    generateJWT,
  };
};
