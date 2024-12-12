/// <reference types='vitest' />
import { defineConfig } from 'vite';

import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import dts from 'vite-plugin-dts';

export default defineConfig({
  root: __dirname,
  cacheDir: '../node_modules/.vite/base-frontend',

  plugins: [
    dts({
      tsconfigPath: './tsconfig.lib.json',
      outDir: '../../dist', // Where to output .d.ts files
      insertTypesEntry: true, // Insert `types` entry into package.json
      copyDtsFiles: true, // Copy .d.ts files to the output
      include: ['src/**/*.ts', 'src/**/*.tsx'], // Ensure inclusion of source files
    }),
    nxViteTsPaths(),
  ],

  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
    outDir: '../dist/libs/base-frontend',
    reportCompressedSize: true,
    sourcemap: true, // Enable source maps for debugging
    lib: {
      entry: 'src/index.ts',
      name: 'base-frontend',
      fileName: 'index',
      formats: ['es'], // Library formats
    },
    rollupOptions: {
      external: [
        '@mui/x-date-pickers',
        'dayjs',
        'react',
        '@mui/material',
        '@mui/icons-material',
        '@the-libs/base-shared',
        'react-router-dom',
        '@react-oauth/google',
        'mongoose',
        'react-hot-toast',
        'zxcvbn',
        'axios',
        '@the-libs/chat-shared',
        '@the-libs/auth-shared',
        '@emotion/styled',
      ],
      onwarn(warning, warn) {
        if (
          warning.message.includes(
            'Module level directives cause errors when bundled, "use client"',
          )
        ) {
          return;
        }
        warn(warning);
      },
    },
    // Ensure the full source files are included
    minify: false, // Disable minification for easier debugging
    emptyOutDir: true,
  },
});
