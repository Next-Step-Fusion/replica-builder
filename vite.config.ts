import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    minify: 'esbuild',
    assetsDir: './'
  },
  esbuild: {
    drop: ['console', 'debugger']
  },
  plugins: [react(), tailwindcss(), createHtmlPlugin()]
});
