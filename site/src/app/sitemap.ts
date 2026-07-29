import type { MetadataRoute } from 'next';

import { localizedDocsPath } from '@/lib/i18n';
import { absoluteSiteUrl } from '@/lib/seo';
import { source } from '@/lib/source';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const homeLanguages = {
    'zh-CN': absoluteSiteUrl('/'),
    en: absoluteSiteUrl('/en'),
    'x-default': absoluteSiteUrl('/'),
  };
  const pages = ['zh', 'en'].flatMap((locale) =>
    source.getPages(locale).map((page) => {
      const zhPath = localizedDocsPath(page.slugs, 'zh');
      const enPath = localizedDocsPath(page.slugs, 'en');
      const path = locale === 'zh' ? zhPath : enPath;

      return {
        url: absoluteSiteUrl(path),
        changeFrequency: 'weekly' as const,
        priority: page.slugs.length === 0 ? 0.9 : 0.7,
        alternates: {
          languages: {
            'zh-CN': absoluteSiteUrl(zhPath),
            en: absoluteSiteUrl(enPath),
            'x-default': absoluteSiteUrl(zhPath),
          },
        },
      };
    }),
  );

  return [
    {
      url: absoluteSiteUrl('/'),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages: homeLanguages },
    },
    {
      url: absoluteSiteUrl('/en'),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: homeLanguages },
    },
    ...pages,
  ];
}
