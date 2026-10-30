import type { Metadata } from 'next';

import { Homepage } from '@/components/homepage/homepage';
import { StructuredData } from '@/components/structured-data';
import { createHomeStructuredData, createPageSeo } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: { absolute: siteConfig.title.en },
  description: siteConfig.description.en,
  ...createPageSeo({
    locale: 'en',
    path: '/en',
    zhPath: '/',
    enPath: '/en',
    title: siteConfig.title.en,
    description: siteConfig.description.en,
    image: '/examples/relationship.png',
  }),
};

export default function Page() {
  return (
    <>
      <StructuredData data={createHomeStructuredData('en')} />
      <Homepage locale="en" />
    </>
  );
}
