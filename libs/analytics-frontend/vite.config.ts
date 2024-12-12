/// <reference types='vitest' />
import { defineConfig } from 'vite';

import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import dts from 'vite-plugin-dts';

export default defineConfig({
  root: __dirname,
  cacheDir: '../node_modules/.vite/analytics-frontend',

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

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: '../dist/libs/analytics-frontend',
    reportCompressedSize: true,
    sourcemap: true, // This enables source maps
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'analytics-frontend',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: ['axios'],
      onwarn(warning, warn) {
        // Suppress the warnings related to MUI's "use client" directive
        if (
          warning.message.includes(
            'Module level directives cause errors when bundled, "use client"',
          )
        ) {
          return;
        }
        // Default warning handler for other warnings
        warn(warning);
      },
    },
    minify: false, // Disable minification for easier debugging
    emptyOutDir: true,
  },
});
