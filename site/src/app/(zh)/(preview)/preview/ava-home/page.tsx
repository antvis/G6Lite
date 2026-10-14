import type { Metadata } from 'next';

import { HomePage } from '@/components/home-page';

export const metadata: Metadata = {
  title: 'G6Lite 独立首页方案',
  description: 'G6Lite 独立首页设计预览：轻量 WebGL 内核、图布局、增量交互与开放扩展。',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <HomePage />;
}
