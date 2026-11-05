import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import type { Locale } from '@/lib/i18n';
import { getNodeDocExampleSnippet, readNodeDocExample, type NodeDocExampleId } from '@/lib/node-doc-example-source';
import { NodeDocPreview } from './node-doc-preview';

// The preview imports these exact files; the displayed code is never copied
// into MDX, so changing a configuration updates its code and output together.
export function NodeDocExample({ id, locale, focus }: { id: NodeDocExampleId; locale: Locale; focus?: string }) {
  const code = readNodeDocExample(id);
  const excerpt = focus ? getNodeDocExampleSnippet(code, focus) : undefined;
  return (
    <NodeDocPreview id={id} locale={locale}>
      {excerpt ? <>
        <ServerCodeBlock lang="ts" code={excerpt} codeblock={{ title: locale === 'zh' ? '关键代码' : 'Key code' }} />
        <details data-example-full-source>
          <summary>{locale === 'zh' ? '完整运行代码' : 'Complete runnable code'}</summary>
          <ServerCodeBlock lang="ts" code={code} />
        </details>
      </> : <ServerCodeBlock lang="ts" code={code} codeblock={{ title: locale === 'zh' ? '完整代码' : 'Complete code' }} />}
    </NodeDocPreview>
  );
}
