import { startExpressServer } from '@the-libs/express-backend';
import { analyticsRouterGenerator } from '@the-libs/analytics-backend';

startExpressServer(analyticsRouterGenerator()).then(() => console.log('ready'));
