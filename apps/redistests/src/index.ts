import { createRedisInstance, set } from '@the-libs/redis-backend';

const example = 'efbh34iufh43fhiou34fhio34hgo43';
const key = 'F34fr-34r_34g34';
console.log('will set with key ' + key + ' the data ' + example);

const redis = await createRedisInstance();
console.log('created client, starting set');
set(redis, key, example)
  .then(() => console.log('success'))
  .catch(() => console.log('fail'));
console.log('finished promise');
