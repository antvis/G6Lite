import { AntVLogo } from '@/components/antv-logo';
import { localizedPath, type Locale } from '@/lib/i18n';
import { siteConfig } from '@/lib/site-config';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(locale: Locale): BaseLayoutProps {
  const text =
    locale === 'zh'
      ? { docs: '文档', examples: '示例', api: 'API', metrics: '技术指标', compatibility: '兼容性' }
      : {
          docs: 'Docs',
          examples: 'Examples',
          api: 'API',
          metrics: 'Metrics',
          compatibility: 'Compatibility',
        };

  return {
    nav: {
      url: localizedPath('/', locale),
      title: (
        <span className="site-brand">
          <AntVLogo className="site-brand-logo" />
          <span className="site-brand-divider" />
          <span className="site-brand-product">G6-GL</span>
        </span>
      ),
    },
    links: [
      { text: text.docs, url: localizedPath('/docs', locale) },
      { text: text.examples, url: localizedPath('/docs/examples', locale) },
      { text: text.api, url: localizedPath('/docs/api', locale) },
      { text: text.metrics, url: localizedPath('/docs/metrics/performance', locale) },
      { text: text.compatibility, url: localizedPath('/docs/compatibility', locale) },
    ],
    searchToggle: { enabled: false },
    i18n: true,
    githubUrl: siteConfig.repository,
  };
}
