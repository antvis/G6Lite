import { createMDX } from 'fumadocs-mdx/next';
import { fileURLToPath } from 'node:url';

const withMDX = createMDX();
const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

// GitHub Pages 子路径部署时设置，例如 "/G6Lite"；本地开发留空。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  basePath,
  allowedDevOrigins: ['127.0.0.1'],
  images: { unoptimized: true },
  // workerLayout.ts points at ./layoutWorker.js so the tsc emit resolves.
  // The source file is layoutWorker.ts; Turbopack does not apply the Vite alias.
  // The target must stay relative to this config. An absolute path is treated
  // as a server-relative import and fails the build.
  turbopack: {
    root: repositoryRoot,
    resolveAlias: {
      './layoutWorker.js': '../src/layout/layoutWorker.ts',
    },
  },
};

export default withMDX(config);
