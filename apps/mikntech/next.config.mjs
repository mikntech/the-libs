const nextConfig = {
  output: 'standalone', // Standalone mode for production
  experimental: {
    esmExternals: true, // Use ESM-compatible externals
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.output.libraryTarget = 'commonjs2'; // Force server-side code to use CommonJS
    }
    return config;
  },
};

export default nextConfig;
