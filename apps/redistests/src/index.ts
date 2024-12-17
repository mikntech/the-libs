import { cache, createRedisInstance, get, set } from '@the-libs/redis-backend';

console.log(
  await cache(
    await createRedisInstance(),
    'erfg34rf23f383u4g34f',
    async () =>
      new Promise((resolve) => setTimeout(() => resolve('43f34r43r2r'), 5000)),
  ),
);
console.log(
  await cache(
    await createRedisInstance(),
    'erfg34rf23f383u4g34f',
    async () =>
      new Promise((resolve) => setTimeout(() => resolve('43f34r43r2r'), 5000)),
  ),
);
console.log(
  await cache(
    await createRedisInstance(),
    '34r',
    async () =>
      new Promise((resolve) => setTimeout(() => resolve('43f34r43r2r'), 5000)),
  ),
);
console.log(
  await cache(
    await createRedisInstance(),
    'erfg34rf2r3wf383u4g34f',
    async () =>
      new Promise((resolve) => setTimeout(() => resolve('43f34r43r2r'), 5000)),
  ),
);
console.log(
  await cache(
    await createRedisInstance(),
    'erfg34rf23weff383u4g34f',
    async () =>
      new Promise((resolve) => setTimeout(() => resolve('43f34r43r2r'), 5000)),
  ),
);
console.log(
  await cache(
    await createRedisInstance(),
    'erfg34rf23f383u4g34f',
    async () =>
      new Promise((resolve) => setTimeout(() => resolve('43f34r43r2r'), 5000)),
  ),
);
