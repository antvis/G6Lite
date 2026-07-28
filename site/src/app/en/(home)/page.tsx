import type { Metadata } from 'next';

import { HomePage } from '@/components/home-page';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: siteConfig.description.en,
  description: `${siteConfig.name} is ${siteConfig.description.en.toLowerCase()}, with one API for data, layouts, interactions, states, and extensions.`,
  alternates: {
    canonical: '/en',
    languages: { 'zh-CN': '/', en: '/en' },
  },
};

export default function Page() {
  return <HomePage locale="en" />;
}
