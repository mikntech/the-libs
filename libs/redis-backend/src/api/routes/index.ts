import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
import type { Queue } from 'bull';

export const createDashboardRoute = (queues: Queue[]) => {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/dashboard');

  createBullBoard({
    queues: queues.map((queue) => new BullAdapter(queue)),
    serverAdapter: serverAdapter,
  });

  return serverAdapter.getRouter();
};
