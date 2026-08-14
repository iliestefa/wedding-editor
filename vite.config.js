import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { buildScssOptions } from './vite.scssOptions.js';

export default defineConfig({
  base: '/wedding-editor/',
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'prop-types'],
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: buildScssOptions(__dirname),
    },
  },
});
