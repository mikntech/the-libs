import BullClass, { JobOptions, ProcessCallbackFunction } from 'bull';
import { redisSettings } from '../../config';

export const createQueue = (queueName: string) =>
  new BullClass(queueName, { redis: redisSettings.uri });

export const add = <DATA>(
  queue: BullClass.Queue<DATA>,
  data: DATA,
  opts?: JobOptions,
) => queue.add(data, opts);

export const process = <DATA>(
  queue: BullClass.Queue<DATA>,
  cb: ProcessCallbackFunction<DATA>,
) => queue.process(cb);
