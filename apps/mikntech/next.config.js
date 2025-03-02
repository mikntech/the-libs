import { config } from 'dotenv';
config();

const nextConfig = {
  output: 'standalone',
  typescript: { ignoreBuildErrors: true },
  env: {
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
};

export default nextConfig;
