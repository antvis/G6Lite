import type { Metadata } from 'next';

import { AiSkillPage } from '@/components/ai-skill/ai-skill-page';
import { StructuredData } from '@/components/structured-data';
import { createAiSkillStructuredData, createPageSeo } from '@/lib/seo';

const title = 'G6Lite Skill — Build graphs with AI';
const description =
  'Give an agent the antv-g6lite-graph skill and invoke $antv-g6lite-graph to generate graphs through the G6Lite package-root API, capability boundary, and validation flow.';

export const metadata: Metadata = {
  title,
  description,
  ...createPageSeo({
    locale: 'en',
    path: '/en/ai',
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
        data={createAiSkillStructuredData({ locale: 'en', path: '/en/ai', description })}
      />
      <AiSkillPage locale="en" />
    </>
  );
}
