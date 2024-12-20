import { defineConfig } from 'vite';
import * as path from 'path';
import { fileURLToPath } from 'url'; // Import this to handle `import.meta.url`
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import dts from 'vite-plugin-dts';

// Polyfill for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    lib: {
      entry: 'src/index.ts',
      name: 'base-frontend',
      fileName: (format) => {
        switch (format) {
          case 'es':
            return 'index.es.js';
          case 'cjs':
            return 'index.cjs.js';
          case 'umd':
            return 'index.umd.js';
          default:
            return `index.${format}.js`;
        }
      },
      formats: ['es', 'cjs', 'umd'],
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
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@mui/material': 'MaterialUI',
          '@mui/icons-material': 'IconsMaterial',
          '@the-libs/base-shared': 'BaseShared',
          'react-router-dom': 'ReactRouterDOM',
          '@mui/x-date-pickers': 'DatePickers',
          axios: 'Axios',
          zxcvbn: 'ZXCVBN',
          'react-hot-toast': 'Toast',
          '@emotion/styled': 'EmotionStyled',
        },
      },
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
