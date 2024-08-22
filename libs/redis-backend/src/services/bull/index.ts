import BullClass, { JobOptions, ProcessCallbackFunction } from 'bull';
import { redisSettings } from '@redis-backend';

const createQueue = (queueName: string) =>
  new BullClass(queueName, { redis: redisSettings.uri });

const add = <DATA>(
  queue: BullClass.Queue<DATA>,
  data: DATA,
  opts?: JobOptions,
) => queue.add(data, opts);

const process = <DATA>(
  queue: BullClass.Queue<DATA>,
  cb: ProcessCallbackFunction<DATA>,
) => queue.process(cb);
