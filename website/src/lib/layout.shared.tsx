import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
    },
    links: [
      { text: '文档', url: '/docs', active: 'nested-url' },
      { text: '指南', url: '/docs/guide/introduction' },
      { text: '指标', url: '/docs/metrics/performance' },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
