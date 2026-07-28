import type { Metadata } from 'next';

import { siteConfig } from '@/lib/site-config';

import LegacyHomePage from './legacy-home-page';

export const metadata: Metadata = {
  title: siteConfig.description.zh,
  description: `${siteConfig.name} 是${siteConfig.description.zh}，提供数据、布局、交互、状态与扩展的一体化 API。`,
  alternates: {
    canonical: '/',
    languages: { 'zh-CN': '/', en: '/en' },
  },
};

export default function Page() {
  return <LegacyHomePage />;
}
