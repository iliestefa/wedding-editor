import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { buildScssOptions } from './vite.scssOptions.js';

// ─── Viewer del Worker ───────────────────────────────────────────────────────
// App mínima que renderiza una invitación desde window.__WEDDING__ (inyectado
// por el Worker al servir /:slug). Compila a worker/public, que el Worker
// sirve como assets. Build: npm run build:viewer
export default defineConfig({
  root: path.resolve(__dirname, 'worker/app'),
  base: '/',
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
  build: {
    outDir: path.resolve(__dirname, 'worker/public'),
    emptyOutDir: true,
  },
});
