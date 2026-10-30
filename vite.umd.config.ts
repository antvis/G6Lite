import { fileURLToPath } from 'node:url';
import { defineConfig, normalizePath } from 'vite';

const workerLayoutPath = normalizePath(
  fileURLToPath(new URL('./src/layout/workerLayout.ts', import.meta.url)),
);
const workerConstructor =
  "new Worker(new URL('./layoutWorker.js', import.meta.url), { type: 'module' })";

export default defineConfig({
  plugins: [
    {
      name: 'g6lite-inline-layout-worker',
      enforce: 'pre',
      transform(code, id) {
        if (id !== workerLayoutPath) return;
        // CDN consumers load a single script, possibly from a different origin.
        // Vite's inline worker bundles its dependencies and creates a local Blob URL.
        if (!code.includes(workerConstructor)) {
          this.error('Layout worker construction changed; update the UMD worker adapter.');
        }
        return {
          code:
            "import InlineLayoutWorker from './layoutWorker.ts?worker&inline';\n" +
            code.replace(workerConstructor, 'new InlineLayoutWorker()'),
          map: null,
        };
      },
    },
  ],
  worker: {
    format: 'iife',
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
  build: {
    emptyOutDir: false,
    target: 'es2020',
    sourcemap: true,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'G6Lite',
      formats: ['umd'],
      fileName: () => 'g6-lite.umd.min.js',
    },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
