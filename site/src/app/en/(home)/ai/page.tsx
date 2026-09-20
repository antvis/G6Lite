import type { Metadata } from 'next';

import { AiWorkspace } from '@/components/ai-workspace';
import { StructuredData } from '@/components/structured-data';
import { createAiWorkspaceStructuredData, createPageSeo } from '@/lib/seo';

const title = 'G6Lite AI — Generate relationship graphs with natural language';
const description =
  'Describe entities and relationships in the in-site G6Lite AI workspace, then explore a graph preview, natural-language refinements, structured data, and G6Lite code.';

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
    image: '/examples/real-dataset.png',
  }),
};

export default function Page() {
  return (
    <>
      <StructuredData
        data={createAiWorkspaceStructuredData({ locale: 'en', path: '/en/ai', description })}
      />
      <AiWorkspace locale="en" />
    </>
  );
}
