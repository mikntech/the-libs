import { config } from 'dotenv';
config();

const nextConfig = {
  output: 'standalone',
  typescript: { ignoreBuildErrors: true },
  experimental: {
    esmExternals: true,
  },
  webpack: (config) => {
    config.output.module = true; // Enforces ESM output
    return config;
  },
};

export default nextConfig;
