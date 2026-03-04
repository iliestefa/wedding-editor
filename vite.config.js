import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/wedding-editor/',
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [path.resolve(__dirname, 'src')],
        silenceDeprecations: ['import'],
        additionalData: (content, filename) => {
          if (filename.includes('src/styles/')) return content;
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
