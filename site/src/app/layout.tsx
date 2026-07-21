import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Provider } from '@/components/provider';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://antvis.github.io/G6Lite';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'G6Lite — 基于 WebGL 的高性能图可视化与分析引擎',
    template: '%s | G6Lite',
  },
  description:
    'G6Lite 是一个基于 WebGL 的高性能图可视化与分析引擎，为大规模图数据而生。轻量、快速、可扩展，内置 15+ 布局与完整交互行为。',
  keywords: ['G6Lite', 'graph', 'visualization', 'webgl', 'antv', 'g6', '图可视化', '图分析'],
  authors: [{ name: 'AntV' }],
  openGraph: {
    title: 'G6Lite — 基于 WebGL 的高性能图可视化与分析引擎',
    description: '轻量、快速、可扩展，让万级节点的图分析在浏览器中流畅运行。',
    url: siteUrl,
    siteName: 'G6Lite',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'G6Lite',
    description: '基于 WebGL 的高性能图可视化与分析引擎，为大规模图数据而生。',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
