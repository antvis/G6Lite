import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName } from './shared';

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
    /* 顶部导航栏保留搜索、主题切换与 GitHub 入口 */
    githubUrl: 'https://github.com/antvis/G6Lite',
  };
}
