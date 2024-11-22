import { createRequire } from 'module';
import { redisSettings } from '@the-libs/redis-backend';
const require = createRequire(import.meta.url);

const { Client } = require('ssh2');
const Redis = require('ioredis');

const ssh = new Client();

console.log('Starting SSH connection setup...');

ssh
  .on('ready', () => {
    console.log('SSH connection ready');
    ssh.forwardOut(
      '127.0.0.1', // Localhost on your machine
      12345, // Arbitrary local port
      '127.0.0.1', // Force to local endpoint via tunnel
      6379, // MemoryDB port
      (err, stream) => {
        if (err) {
          console.error('Error in SSH forwardOut:', err);
          ssh.end();
          return;
        }
        console.log('SSH tunnel established');

        // Create Redis client with explicit stream
        const redis = new Redis({
          stream,
          tls: {
            rejectUnauthorized: false, // Disable for testing, remove in production
          },
          enableOfflineQueue: false,
        });

        redis
          .on('connect', () => console.log('Connected to MemoryDB'))
          .on('ready', () => {
            console.log('MemoryDB connection ready');
            redis
              .set('key', 'value')
              .then(() => console.log('Value set successfully'))
              .catch((err) => console.error('Error setting value:', err))
              .finally(() => {
                redis.quit();
                ssh.end();
              });
          })
          .on('error', (err) => console.error('Redis error:', err));
      },
    );
  })
  .on('error', (err) => console.error('SSH connection error:', err))
  .on('close', () => console.log('SSH connection closed'))
  .connect({
    host: redisSettings.ec2Proxy.ip,
    port: 22,
    username: 'ec2-user',
    privateKey: redisSettings.ec2Proxy.pem.replace(/\\n/g, '\n'),
  });
