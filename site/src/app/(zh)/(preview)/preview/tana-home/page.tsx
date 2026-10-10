import type { Metadata } from 'next';

import { TanaHomePage } from './tana-home-page';

export const metadata: Metadata = {
  title: 'Tana 风格首页方案预览',
  description: 'G6Lite 编辑式产品首页视觉方案，仅用于独立预览和比较。',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <TanaHomePage preview />;
}
