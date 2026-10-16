import type { Metadata } from 'next';

import { AiSkillPage } from '@/components/ai-skill/ai-skill-page';
import { StructuredData } from '@/components/structured-data';
import { createAiSkillStructuredData, createPageSeo } from '@/lib/seo';

const title = 'G6Lite Skill — 在 AI 中构建关系图';
const description =
  '把 skills/antv-g6lite-graph 交给 Agent，用 $antv-g6lite-graph 按 G6Lite 包根 API、能力边界和验证流程生成关系图。';

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
    image: '/examples/relationship.png',
  }),
};

export default function Page() {
  return (
    <>
      <StructuredData
        data={createAiSkillStructuredData({ locale: 'zh', path: '/ai', description })}
      />
      <AiSkillPage locale="zh" />
    </>
  );
}
