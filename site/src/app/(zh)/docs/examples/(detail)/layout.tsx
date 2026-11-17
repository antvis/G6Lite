import type { ReactNode } from 'react';
import { ExampleDetailLayout } from '@/components/example-detail-layout';

export default function Layout({ children }: { children: ReactNode }) {
  return <ExampleDetailLayout locale="zh">{children}</ExampleDetailLayout>;
}
