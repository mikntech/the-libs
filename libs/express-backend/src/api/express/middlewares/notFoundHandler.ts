import { NextFunction, Request as ExpressRequest, Response } from 'express';

interface Layer {
  route?: {
    path: string;
    methods: { [method: string]: boolean };
  };
  handle?: { stack: Layer[] };
  regexp?: { source: string };
}

/**
 * Extracts all routes from the given router stack.
 * @param layers - The router layers to process.
 * @param basePath - The base path for nested routers.
 * @returns A list of formatted routes.
 */
const extractRoutes = (layers?: Layer[], basePath: string = ''): string[] =>
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
  }) ?? [];

/**
 * Formats a raw route path by removing regex and optional characters.
 * @param source - The raw route path regex source.
 * @returns The cleaned route path.
 */
const formatRoutePath = (source: string): string =>
  source
    .replace(/^\^\\/, '') // Remove the leading ^\ which marks the start of the string
    .replace(/\\\/\?\$?/g, '') // Remove optional trailing slash
    .replace(/\(\?\:.*?\)/g, '') // Remove non-capturing groups
    .replace(/\(\?\=.*?\)/g, '') // Remove lookahead assertions
    .replace(/\?/g, '') // Remove remaining ? used for optional characters
    .replace(/\\/g, '') // Remove backslashes used for escaping
    .replace(/\/+$/, ''); // Remove any trailing slashes

/**
 * Filters routes based on a given base path.
 * @param routes - The list of routes to filter.
 * @param filter - The base path to match against.
 * @returns A filtered list of routes.
 */
const filterRoutes = (routes: string[], filter: string): string[] =>
  routes.filter((route) => {
    const [_, routePath] = route.split(' ', 2);
    return routePath.startsWith(filter);
  });

/**
 * Builds a hierarchical route tree from a list of routes.
 * @param routes - The list of routes.
 * @returns The constructed route tree.
 */
const buildRouteTree = (routes: string[]): Record<string, any> => {
  const routeTree: Record<string, any> = {};

  routes.forEach((route) => {
    const [method, path = ''] = route.trim().split(' ');

    let current: any = routeTree;
    const segments = path.split('/').filter(Boolean);

    segments.forEach((segment) => {
      if (!current[segment]) {
        current[segment] = {};
      }
      current = current[segment];
    });

    current.method = current.method || [];
    current.method.push(method);
  });

  return routeTree;
};

/**
 * Middleware to handle auto-generated helper responses.
 */
export const autoHelper = (
  req: ExpressRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!res.headersSent) {
    const basePath = req.baseUrl;

    try {
      // Extract routes from the application router stack
      const allRoutes = extractRoutes(req.app._router.stack);
      //

      // Filter routes based on the base path
      const relevantRoutes = filterRoutes(allRoutes, basePath);
      //

      // Determine available routes
      const availableRoutes =
        relevantRoutes.length > 0
          ? relevantRoutes
          : ['No available routes under this path'];

      // Build a route tree if valid routes are available
      let inTree: Record<string, any> | { error: string } = {
        error: 'Could not build route tree',
      };
      if (availableRoutes[0] !== 'No available routes under this path') {
        try {
          inTree = buildRouteTree(availableRoutes);
        } catch (error) {}
      }

      // Respond with the results
      res.status(404).json({
        message: 'Route not found',
        availableRoutes,
        inTree,
      });
    } catch (error: any) {
      res.status(500).json({
        message: 'An unexpected error occurred in the autoHelper middleware',
        error: error.message,
      });
    }
  } else {
    next();
  }
};
