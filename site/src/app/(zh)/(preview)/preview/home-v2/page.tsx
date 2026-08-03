import { HomePage } from '@/components/home-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '首页优化方案预览',
  description: 'G6Lite 此前优化版中文首页，仅用于与当前首页进行视觉和内容对比。',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <HomePage locale="zh" />;
}
