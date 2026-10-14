import type { Metadata } from 'next';

import { StructuredData } from '@/components/structured-data';
import { createHomeStructuredData, createPageSeo } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

import { Homepage } from '@/components/homepage/homepage';

export const metadata: Metadata = {
  title: siteConfig.description.zh,
  description: `${siteConfig.name} 是${siteConfig.description.zh}，提供数据、布局、交互、状态与扩展的一体化 API。`,
  ...createPageSeo({
    locale: 'zh',
    path: '/',
    zhPath: '/',
    enPath: '/en',
    title: `${siteConfig.name} — ${siteConfig.description.zh}`,
    description: `${siteConfig.name} 是${siteConfig.description.zh}，提供数据、布局、交互、状态与扩展的一体化 API。`,
    image: '/homepage/examples/network.png',
  }),
};

export default function Page() {
  return (
    <>
      <StructuredData data={createHomeStructuredData('zh')} />
      <Homepage locale="zh" />
    </>
  );
}
