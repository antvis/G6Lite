import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import type { Locale } from '@/lib/i18n';
import { readNodeDocExample, type NodeDocExampleId } from '@/lib/node-doc-example-source';
import { NodeDocPreview } from './node-doc-preview';

// The preview imports these exact files; the displayed code is never copied
// into MDX, so changing a configuration updates its code and output together.
export function NodeDocExample({ id, locale }: { id: NodeDocExampleId; locale: Locale }) {
  const code = readNodeDocExample(id);
  return (
    <NodeDocPreview id={id} locale={locale}>
      <ServerCodeBlock lang="ts" code={code} codeblock={{ title: locale === 'zh' ? '完整代码' : 'Complete code' }} />
    </NodeDocPreview>
  );
}
