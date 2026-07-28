import type { MetadataRoute } from 'next';

import { source } from '@/lib/source';
import { siteConfig } from '@/lib/site-config';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['zh', 'en'].flatMap((locale) =>
    source.getPages(locale).map((page) => ({
      url: new URL(page.url, siteConfig.url).toString(),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page.slugs.length === 0 ? 0.9 : 0.7,
    })),
  );

  return [
    { url: siteConfig.url, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    {
      url: `${siteConfig.url}/en`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...pages,
  ];
}
