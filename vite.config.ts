import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'playground',
  base: './',
  server: { open: true },
  resolve: {
    alias: { '@antv/g6-lite': new URL('./src/index.ts', import.meta.url).pathname },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'playground/index.html'),
        bench: resolve(__dirname, 'playground/bench.html'),
      },
    },
  },
});
