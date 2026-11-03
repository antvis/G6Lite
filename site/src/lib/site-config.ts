import packageJson from '../../../package.json';
import { productCopy } from './product-copy';

export const siteConfig = {
  name: 'G6Lite',
  packageName: packageJson.name,
  version: packageJson.version,
  title: { zh: productCopy.zh.title, en: productCopy.en.title },
  description: {
    zh: productCopy.zh.hero.description,
    en: productCopy.en.hero.description,
  },
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://g6lite.antv.vision',
  repository: 'https://github.com/antvis/G6Lite',
  npm: 'https://www.npmjs.com/package/@antv/g6-lite',
} as const;
