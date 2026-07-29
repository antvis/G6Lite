import type { Metadata } from 'next';

import { HomePage } from '@/components/home-page';
import { StructuredData } from '@/components/structured-data';
import { createHomeStructuredData, createPageSeo } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

const description = `${siteConfig.name} is ${siteConfig.description.en.toLowerCase()}, with one API for data, layouts, interactions, states, and extensions.`;

export const metadata: Metadata = {
  title: 'High-performance WebGL graph visualization',
  description,
  ...createPageSeo({
    locale: 'en',
    path: '/en',
    zhPath: '/',
    enPath: '/en',
    title: `${siteConfig.name} — High-performance WebGL graph visualization`,
    description,
    image: '/examples/real-dataset.png',
  }),
};

export default function Page() {
  return (
    <>
      <StructuredData data={createHomeStructuredData('en')} />
      <HomePage locale="en" />
    </>
  );
}
