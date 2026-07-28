import { baseOptions } from '@/lib/layout.shared';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

import './legacy-home.css';

export default function Layout({ children }: LayoutProps<'/'>) {
  return <HomeLayout {...baseOptions('zh')}>{children}</HomeLayout>;
}
