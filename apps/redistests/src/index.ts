import { createRedisInstance, get, set } from '@the-libs/redis-backend';

await set(await createRedisInstance(), 'asdsad766', 'asdjnbvug8yasd');
console.log('success');
console.log(await get(await createRedisInstance(), 'asdsasdasdad766'));
console.log(await get(await createRedisInstance(), 'asdsad766'));
