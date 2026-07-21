import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// GitHub Pages 子路径部署时设置，例如 "/G6Lite"；本地开发留空。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  basePath,
  images: { unoptimized: true },
};

export default withMDX(config);
