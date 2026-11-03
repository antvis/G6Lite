import { DevReloadGuard } from '@/components/dev-reload-guard';
import { Provider } from '@/components/provider';
import { headingFont } from '@/lib/site-font';
import { siteConfig } from '@/lib/site-config';
import type { Metadata } from 'next';

import '../global.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title.zh,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description.zh,
  keywords: ['G6Lite', 'graph', 'visualization', 'webgl', 'antv', 'g6', '图可视化', '图分析'],
  authors: [{ name: 'AntV' }],
  applicationName: siteConfig.name,
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg?v=antv-20260724' },
  openGraph: {
    title: siteConfig.title.zh,
    description: siteConfig.description.zh,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: 'website',
    images: ['/examples/real-dataset.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title.zh,
    description: siteConfig.description.zh,
    images: ['/examples/real-dataset.png'],
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" className={headingFont.variable} suppressHydrationWarning>
      <head>
        <DevReloadGuard />
      </head>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
