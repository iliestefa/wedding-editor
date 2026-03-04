import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

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
      scss: {
        loadPaths: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules/@iliestefa/wedding-soho/src'),
        ],
        silenceDeprecations: ['import'],
        additionalData: (content, filename) => {
          if (filename.includes('/styles/')) return content;
          return `
            @import 'styles/variables';
            @import 'styles/mixins';
            @import 'styles/animations';
          ` + content;
        },
      },
    },
  },
});
