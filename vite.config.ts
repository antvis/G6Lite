import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'playground',
  base: './',
  server: { open: true },
  worker: { format: 'es' },
  resolve: {
    alias: {
      '@antv/g6-lite': new URL('./src/index.ts', import.meta.url).pathname,
      // Source references the layout worker as './layoutWorker.js' so the
      // tsc-emitted dist resolves it correctly at runtime. Vite serves the TS
      // source directly, so redirect the .js worker URL to its .ts source.
      [resolve(__dirname, 'src/layout/layoutWorker.js')]: resolve(
        __dirname,
        'src/layout/layoutWorker.ts',
      ),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'playground/index.html'),
        performance: resolve(__dirname, 'playground/performance.html'),
      },
    },
  },
});
