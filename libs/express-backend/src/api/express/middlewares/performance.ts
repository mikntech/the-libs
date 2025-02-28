import { v4 } from 'uuid';

export const performanceMonitor = (req: any, _: any, next: any) => {
  req.uid = { uid: v4(), time: performance.now() };
  next();
};
