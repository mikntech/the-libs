import { Router } from 'express';
import { Strategy } from 'auth-backend';
import { genRegisterControllers } from '../../../controllers/auth/register';

export const registerRouter = <S>(strategy: Strategy<S>) => {
  const router = Router();

  // const {} = genRegisterControllers(strategy);

  /*

  router.post(
    '/request' + (multi === MultiUserType.SINGLE ? '' : '/:MultiUserType'),
    highOrderHandler((async (req: AuthenticatedRequest) => {
      const { email } = req.body;
      const MultiUserType =
        multi !== MultiUserType.SINGLE && req.params['MultiUserType'];
      const MultiUserTypeParam: [MultiUserTypeEnum?] = MultiUserType
        ? [MultiUserType as MultiUserTypeEnum]
        : [];
      return requestToRegister<User, MultiUserTypeEnum>(
        email,
        ...(MultiUserTypeParam as TODO),
      );
    }) as unknown as TODO),
  );

  router.post(
    '/finish',
    highOrderHandler((async (req: AuthenticatedRequest) => {
      const { key, full_name, phone_number, password, passwordAgain } =
        req.body;
      return finishRegistration(
        key,
        full_name,
        phone_number,
        password,
        passwordAgain,
      );
    }) as unknown as TODO),
  );
*/

  return router;
};
