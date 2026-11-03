import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

// Runtime dependencies stay external in the ESM bundle so consumers keep the
// lazy per-layout loading behavior (`import('@antv/layout/lib/...')`).
const external = ['@antv/event-emitter', 'regl', /^@antv\/layout(\/|$)/];

const ts = () =>
  typescript({
    tsconfig: './tsconfig.json',
    compilerOptions: {
      noEmit: false,
      declaration: false,
      declarationMap: false,
      sourceMap: true,
    },
  });

export default [
  // npm 产物：ESM bundle + 独立 layout worker chunk。
  {
    input: {
      index: 'src/index.ts',
      // workerLayout.ts 以 `new URL('./layoutWorker.js', import.meta.url)` 引用
      // worker，入口必须保持扁平文件名，落在 dist 根目录。
      layoutWorker: 'src/layout/layoutWorker.ts',
    },
    external,
    output: {
      dir: 'dist',
      format: 'es',
      entryFileNames: '[name].js',
      chunkFileNames: 'chunks/[name]-[hash].js',
      sourcemap: true,
    },
    plugins: [ts()],
  },
  // 汇总类型声明为单个自包含文件，依赖类型保持外部引用。
  {
    input: 'src/index.ts',
    external,
    output: { file: 'dist/index.d.ts', format: 'es' },
    plugins: [dts({ respectExternal: true, compilerOptions: { stripInternal: true } })],
  },
  // 浏览器 script 标签直引的 UMD bundle（依赖内联；worker 失败自动回退主线程）。
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/g6-lite.min.js',
      format: 'umd',
      name: 'G6Lite',
      sourcemap: true,
      inlineDynamicImports: true,
      plugins: [terser()],
    },
    plugins: [resolve({ browser: true, preferBuiltins: false }), commonjs(), ts()],
  },
];
