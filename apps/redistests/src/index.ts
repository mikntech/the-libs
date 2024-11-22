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
    // Forward traffic from local to MemoryDB via EC2
    ssh.forwardOut(
      '127.0.0.1', // Localhost on your machine
      12345, // Arbitrary local port
      redisSettings.uri.tls.servername, // Replace with MemoryDB cluster endpoint
      6379, // MemoryDB port
      (err, stream) => {
        if (err) {
          console.error('Error in SSH forwardOut:', err);
          ssh.end();
          return;
        }
        console.log('SSH tunnel to MemoryDB established');

        // Connect to MemoryDB via the tunnel
        const redis = new Redis({
          stream: stream, // Use the stream from SSH
          enableOfflineQueue: false,
          lazyConnect: true,
          tls: redisSettings.uri.tls, // MemoryDB requires TLS
        });

        redis
          .on('connect', () => {
            console.log('Connected to MemoryDB');
          })
          .on('error', (err) => {
            console.error('MemoryDB connection error:', err);
          });

        // Perform a Redis operation
        redis.set('key', 'value', (err) => {
          if (err) {
            console.error('Error setting value in MemoryDB:', err);
          } else {
            console.log('Value set successfully in MemoryDB');
          }

          // Cleanup connections
          redis.quit();
          ssh.end();
        });
      },
    );
  })
  .on('error', (err) => {
    console.error('SSH connection error:', err);
  })
  .on('end', () => {
    console.log('SSH connection ended');
  })
  .on('close', (hadError) => {
    console.log('SSH connection closed', hadError ? 'with error' : 'cleanly');
  })
  .connect({
    host: redisSettings.ec2Proxy.ip, // EC2 instance IP (bastion)
    port: 22, // SSH port
    username: 'ec2-user', // EC2 username
    privateKey: redisSettings.ec2Proxy.pem.replace(/\\n/g, '\n'), // PEM key
    readyTimeout: 10000, // Optional: Timeout in ms
    debug: (info) => console.log('SSH debug info:', info), // Debug logs
  });
