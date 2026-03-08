import { defineConfig } from 'vite';

export default defineConfig({
  root: 'playground',
  server: { open: true },
  resolve: {
    alias: { '@antv/g6-lite': new URL('./src/index.ts', import.meta.url).pathname },
  },
});
