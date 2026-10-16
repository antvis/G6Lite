import { AntVLogo } from '@/components/antv-logo';
import { localizedPath, type Locale } from '@/lib/i18n';
import { siteConfig } from '@/lib/site-config';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(locale: Locale): BaseLayoutProps {
  const text =
    locale === 'zh'
      ? {
          docs: '文档',
          examples: '示例',
          ai: 'AI',
        }
      : {
          docs: 'Docs',
          examples: 'Examples',
          ai: 'AI',
        };

  return {
    nav: {
      url: localizedPath('/', locale),
      title: (
        <span className="site-brand">
          <AntVLogo className="site-brand-logo" />
          <span className="site-brand-divider" />
          <span className="site-brand-product">G6Lite</span>
        </span>
      ),
    },
    links: [
      { text: text.docs, url: localizedPath('/docs', locale) },
      { text: text.examples, url: localizedPath('/docs/examples', locale) },
      { text: text.ai, url: localizedPath('/ai', locale) },
    ],
    searchToggle: { enabled: false },
    i18n: true,
    githubUrl: siteConfig.repository,
  };
}
