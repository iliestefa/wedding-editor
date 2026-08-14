import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { buildScssOptions } from './vite.scssOptions.js';

export default defineConfig({
  // GitHub Pages sirve desde /wedding-editor/; Cloudflare Pages (editor.mywedya.com)
  // sirve desde la raíz. VITE_BASE_PATH permite un build distinto por destino.
  base: process.env.VITE_BASE_PATH ?? '/wedding-editor/',
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
