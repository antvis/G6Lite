import { Provider } from '@/components/provider';
import { siteConfig } from '@/lib/site-config';
import type { Metadata } from 'next';

import '../global.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.description.zh}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: `${siteConfig.name} 是${siteConfig.description.zh}，提供数据、布局、交互、状态与扩展的一体化 API。`,
  keywords: ['G6-GL', 'graph', 'visualization', 'webgl', 'antv', 'g6', '图可视化', '图分析'],
  authors: [{ name: 'AntV' }],
  applicationName: siteConfig.name,
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg?v=antv-20260724' },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.description.zh}`,
    description: siteConfig.description.zh,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: 'website',
    images: ['/examples/real-dataset.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description.zh,
    images: ['/examples/real-dataset.png'],
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
