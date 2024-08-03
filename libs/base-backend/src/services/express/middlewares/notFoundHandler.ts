import { NextFunction, Request as ExpressRequest, Response } from 'express';
import { TODO } from 'base-shared';

interface Layer {
  route?: {
    path: string;
    methods: { [method: string]: boolean };
  };
  handle?: { stack: Layer[] };
  regexp?: { source: string };
}

const extractRoutes = (layers?: Layer[], basePath: string = ''): string[] => {
  return (
    layers?.flatMap((layer) => {
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
    }) ?? []
  );
};

const formatRoutePath = (source: string): string => {
  return source
    .replace(/^\^\\/, '') // Remove the leading ^\ which marks the start of the string
    .replace(/\\\/\?\$?/g, '') // Remove optional trailing slash
    .replace(/\(\?\:.*?\)/g, '') // Remove non-capturing groups
    .replace(/\(\?\=.*?\)/g, '') // Remove lookahead assertions
    .replace(/\?/g, '') // Remove remaining ? used for optional characters
    .replace(/\\/g, '') // Remove backslashes used for escaping
    .replace(/\/+$/, ''); // Remove any trailing slashes
};

const filterRoutes = (routes: string[], filter: string): string[] => {
  return routes.filter((route) => {
    const pathSegments = route.split('/');
    pathSegments.shift();
    const final = pathSegments.join('/');
    return final.startsWith(filter);
  });
};

export const autoHelper = (
  req: ExpressRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!res.headersSent) {
    const basePath = req.baseUrl;
    const allRoutes = extractRoutes((req.app as TODO)._router.stack).map(
      (route) => {
        const cleanedRoute = formatRoutePath(route);
        return `${cleanedRoute}`.replace(/\/\/+/g, '/');
      },
    );

    const relevantRoutes = filterRoutes(allRoutes, basePath);

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
