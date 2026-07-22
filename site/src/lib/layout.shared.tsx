import { AntVLogo } from '@/components/antv-logo';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="site-brand">
          <AntVLogo className="site-brand-logo" />
          <span className="site-brand-divider" />
          <span className="site-brand-product">G6-GL</span>
        </span>
      ),
    },
    links: [
      { text: '文档', url: '/docs' },
      { text: '指南', url: '/docs/getting-started/quick-start' },
      { text: '示例', url: '/docs/examples' },
      { text: '指标', url: '/docs/metrics/performance' },
    ],
    /* 顶部导航栏保留搜索、主题切换与 GitHub 入口 */
    githubUrl: 'https://github.com/antvis/G6Lite',
  };
}
