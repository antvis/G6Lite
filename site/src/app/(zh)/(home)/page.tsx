import type { Metadata } from 'next';

import { StructuredData } from '@/components/structured-data';
import { createHomeStructuredData, createPageSeo } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

import { Homepage } from '@/components/homepage/homepage';

export const metadata: Metadata = {
  title: { absolute: siteConfig.title.zh },
  description: siteConfig.description.zh,
  ...createPageSeo({
    locale: 'zh',
    path: '/',
    zhPath: '/',
    enPath: '/en',
    title: siteConfig.title.zh,
    description: siteConfig.description.zh,
    image: '/examples/relationship.png',
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
