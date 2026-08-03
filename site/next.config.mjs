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
  turbopack: { root: repositoryRoot },
};

export default withMDX(config);
