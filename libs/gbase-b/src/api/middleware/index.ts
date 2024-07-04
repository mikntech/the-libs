import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request as ExpressRequest, Response } from 'express';
import errorLog from '../../schemas/logs/errorLog';
import { ClientError } from '../../exceptions';
import { TODO } from '../../types';
import { Model } from 'mongoose';
import { StagingEnvironment } from '../../config';

type User = TODO;

export interface AuthenticatedRequest extends ExpressRequest {
  user: User | null;
}

export const serverErrorHandler =
  <SE = StagingEnvironment>(stagingEnv: SE) =>
  async (
    err: TODO,
    _: ExpressRequest,
    res: Response,
    next: NextFunction
  ): Promise<TODO> => {
    if (err) {
      if (err instanceof ClientError) return res.status(400).send(err);
      try {
        await new (errorLog())({
          stringifiedError: err.toString(),
        }).save();
        console.log('Error was logged to mongo');
        if (stagingEnv === 'local') throw err;
      } catch (e) {
        console.log('Error logging error to mongo: ', e);
      }
      if (!res.headersSent) {
        return res.status(500).send('Server error');
      }
    } else {
      next(err);
    }
  };

type AccountType = TODO;

export const authorizer =
  <SCHEMA>(jwtSecret: string, model: Model<SCHEMA>) =>
  async (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    try {
      const validatedUser: JwtPayload | string = jsonwebtoken.verify(
        req.cookies['jwt'],
        jwtSecret
      );
      if (typeof validatedUser === 'string') throw new Error('Micherrro');
      req.user = await model.findById(validatedUser['id']);
      if (validatedUser['accountType'])
        req.user.validatedUser = validatedUser['accountType'];
    } catch (err) {
      req.user = null;
    }
    next();
  };

const extractRoutes = (layers: TODO, basePath = '') => {
  let routes: TODO[] = [];
  layers?.forEach((layer: TODO) => {
    if (layer.route) {
      let methods = Object.keys(layer.route.methods)
        .filter((method) => layer.route.methods[method])
        .map((method) => method.toUpperCase())
        .join(', ');
      routes.push(`${methods} ${basePath}${layer.route.path}`);
    } else {
      // router middleware
      const subRoutes = extractRoutes(
        layer.handle.stack,
        basePath +
          (
            layer.regexp.source
              .replace('^\\/', '')
              .replace('\\/?$', '')
              .replace('(?:\\/(?=$))?', '')
              .replace('\\', '') || ''
          ).replace('?(?=\\/|$)', '')
      );
      routes = routes.concat(subRoutes);
    }
  });
  return routes;
};

export const autoDocer = (
  req: ExpressRequest,
  res: Response,
  next: NextFunction
) => {
  const pathSegmentsToFilter: string[] = req.originalUrl.split('/');
  while (pathSegmentsToFilter.findIndex((r) => r === 'api') !== -1)
    pathSegmentsToFilter.shift();
  const finalToFilter = pathSegmentsToFilter.join('/');
  if (!res.headersSent) {
    const allRoutes = extractRoutes(req.app._router.stack).map((str) =>
      str.replace('//', '/')
    );
    const relevantRoutes = allRoutes.filter((route) => {
      const pathSegments = route.split('/');
      pathSegments.shift();
      const final = pathSegments.join('/');
      return final.startsWith(finalToFilter);
    });

    res.status(404).json({
      message: 'Route not found',
      availableRoutes:
        relevantRoutes.length > 0
          ? relevantRoutes
          : ['No available routes under this path'],
    });
  } else {
    next();
  }
};
