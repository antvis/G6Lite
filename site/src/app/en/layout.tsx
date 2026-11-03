import { DevReloadGuard } from '@/components/dev-reload-guard';
import { Provider } from '@/components/provider';
import { headingFont } from '@/lib/site-font';
import { siteConfig } from '@/lib/site-config';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '../global.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title.en,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description.en,
  keywords: ['G6Lite', 'graph visualization', 'WebGL', 'AntV', 'graph rendering', 'TypeScript'],
  authors: [{ name: 'AntV' }],
  applicationName: siteConfig.name,
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg?v=antv-20260724' },
  openGraph: {
    title: siteConfig.title.en,
    description: siteConfig.description.en,
    url: `${siteConfig.url}/en`,
    siteName: siteConfig.name,
    type: 'website',
    locale: 'en_US',
    images: ['/examples/real-dataset.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title.en,
    description: siteConfig.description.en,
    images: ['/examples/real-dataset.png'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={headingFont.variable} suppressHydrationWarning>
      <head>
        <DevReloadGuard />
      </head>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
