import { createRedisInstance, set } from '@the-libs/redis-backend';

(async () => {
  const example = 'efbh34iufh43fhiou34fhio34hgo43';
  const key = 'F34fr-34r_34g34';

  console.log('will set with key ' + key + ' the data ' + example);

  try {
    console.log('[DEBUG] Starting Redis client creation...');
    const redis = await createRedisInstance();
    console.log('[DEBUG] Redis client created with status:', redis.status);

    if (redis.status !== 'ready') {
      console.log(
        '[DEBUG] Redis client is not ready. Waiting for connection...',
      );
      await new Promise<void>((resolve, reject) => {
        redis.once('ready', () => {
          console.log('[DEBUG] Redis client is now ready.');
          resolve();
        });
        redis.once('error', (err) => {
          console.error(
            '[ERROR] Redis connection error during readiness wait:',
            err,
          );
          reject(err);
        });
      });
    }

    console.log('[DEBUG] Starting SET operation...');
    await set(redis, key, example);
    console.log('[INFO] Successfully set key-value pair.');
  } catch (err) {
    console.error('[ERROR] An error occurred:', err);
  }

  console.log('[DEBUG] Finished script execution.');
})();
