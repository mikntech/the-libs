import type {
  NextFunction,
  Request as ExpressRequest,
  Response,
} from 'express';
import { TODO } from '@the-libs/base-shared';

interface Layer {
  route?: {
    path: string;
    methods: { [method: string]: boolean };
  };
  handle?: { stack: Layer[] };
  regexp?: { source: string };
}

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

const formatRoutePath = (source: string): string =>
  source
    .replace(/^\^\\/, '') // Remove the leading ^\ which marks the start of the string
    .replace(/\\\/\?\$?/g, '') // Remove optional trailing slash
    .replace(/\(\?\:.*?\)/g, '') // Remove non-capturing groups
    .replace(/\(\?\=.*?\)/g, '') // Remove lookahead assertions
    .replace(/\?/g, '') // Remove remaining ? used for optional characters
    .replace(/\\/g, '') // Remove backslashes used for escaping
    .replace(/\/+$/, ''); // Remove any trailing slashes

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

    const availableRoutes =
      relevantRoutes.length > 0
        ? relevantRoutes
        : ['No available routes under this path'];

    let inTree: TODO = 'error';
    try {
      inTree = buildRouteTree(availableRoutes);
    } catch {}

    res.status(404).json({
      message: 'Route not found',
      availableRoutes,
      inTree,
    });
  } else {
    next();
  }
};

function buildRouteTree(routes: string[]) {
  const routeTree: TODO = {};

  routes.forEach((route) => {
    // Split the route by space to separate method and path
    const [method, path = ''] = route.trim().split(' ');

    // Start at the root of the tree
    let current = routeTree;

    // Split the path into segments
    const segments = path.split('/').filter(Boolean);

    // Traverse the tree, creating nodes as necessary
    segments.forEach((segment, index) => {
      if (!current[segment]) {
        current[segment] = {};
      }
      current = current[segment];
    });

    // Add the method to the final node in the path
    current.method = current.method || [];
    current.method.push(method);
  });

  return routeTree;
}
