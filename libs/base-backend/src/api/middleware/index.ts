import { NextFunction, Request as ExpressRequest, Response } from 'express';
import errorLog from '../../schemas/logs/errorLog';
import { ClientError } from '../../exceptions';
import { TODO } from '../../types';
import { StagingEnvironment } from '../../config';

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
         (stagingEnv === 'local') && console.log("the error: ",err);
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

interface Layer {
  route?: {
    path: string;
    methods: { [method: string]: boolean };
  };
  handle?: { stack: Layer[] };
  regexp?: { source: string };
}
const extractRoutes = (layers: Layer[], basePath: string = ''): string[] => {
  return layers.flatMap((layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .filter((method) => layer.route?.methods?.[method])
        .map((method) => method.toUpperCase())
        .join(', ');
      return [`${methods} ${basePath}${layer.route.path}`];
    } else if (layer.handle && layer.regexp) {
      const routePath = formatRoutePath(layer.regexp.source);
      return extractRoutes(layer.handle.stack, `${basePath}${routePath}`);
    } else {
      return [];
    }
  });
};
const formatRoutePath = (source: string): string => {
  return (
    source
      .replace('^\\/', '')
      .replace('\\/?$', '')
      .replace('(?:\\/(?=$))?', '')
      .replace('\\', '') ?? ''
  );
};
const filterRoutes = (routes: string[], filter: string): string[] => {
  return routes.filter((route) => {
    const pathSegments = route.split('/');
    pathSegments.shift(); // Remove the first element, typically empty due to leading slash
    const final = pathSegments.join('/');
    return final.startsWith(filter);
  });
};

export const autoHelper = (
  req: ExpressRequest,
  res: Response,
  next: NextFunction
): void => {
  const pathSegmentsToFilter = req.originalUrl.split('/');
  while (pathSegmentsToFilter.includes('api')) {
    pathSegmentsToFilter.shift();
  }
  const finalToFilter = pathSegmentsToFilter.join('/');

  if (!res.headersSent) {
    const allRoutes = extractRoutes((req.app as any)._router.stack).map(
      (route) => route.replace('//', '/')
    );
    const relevantRoutes = filterRoutes(allRoutes, finalToFilter);

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
