import packageJson from '../../../package.json';

export const siteConfig = {
  name: 'G6Lite',
  packageName: packageJson.name,
  version: packageJson.version,
  description: {
    zh: '基于 WebGL 的高性能轻量图可视化引擎',
    en: 'A lightweight, high-performance WebGL graph visualization engine',
  },
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://g6lite.antv.vision',
  repository: 'https://github.com/antvis/G6Lite',
  npm: 'https://www.npmjs.com/package/@antv/g6-lite',
} as const;
