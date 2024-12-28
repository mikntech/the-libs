import { config } from 'dotenv';
config();

const nextConfig = {
  output: 'standalone',
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
