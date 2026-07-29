import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/site-config';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description.zh,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ec3d75',
    icons: [{ src: '/icon.svg?v=antv-20260724', sizes: 'any', type: 'image/svg+xml' }],
  };
}
