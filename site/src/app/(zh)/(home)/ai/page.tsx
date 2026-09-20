import type { Metadata } from 'next';

import { AiWorkspace } from '@/components/ai-workspace';
import { StructuredData } from '@/components/structured-data';
import { createAiWorkspaceStructuredData, createPageSeo } from '@/lib/seo';

const title = 'G6Lite AI — 用自然语言生成关系图';
const description =
  '在 G6Lite 站内 AI 工作台中描述实体与关系，体验关系图生成、自然语言调整、图数据和 G6Lite 代码检查。';

export const metadata: Metadata = {
  title,
  description,
  ...createPageSeo({
    locale: 'zh',
    path: '/ai',
    zhPath: '/ai',
    enPath: '/en/ai',
    title,
    description,
    image: '/examples/real-dataset.png',
  }),
};

export default function Page() {
  return (
    <>
      <StructuredData
        data={createAiWorkspaceStructuredData({ locale: 'zh', path: '/ai', description })}
      />
      <AiWorkspace locale="zh" />
    </>
  );
}
