import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import type { BuiltInLayoutExample } from '../../demos/docs-built-in-layout.ts';
import type { Locale } from '@/lib/i18n';
import { getNodeDocExampleSnippet, readBuiltInLayoutExample, readNodeDocExample, type NodeDocExampleId } from '@/lib/node-doc-example-source';
import { NodeDocCodeTabs } from './node-doc-code-tabs';
import { NodeDocPreview } from './node-doc-preview';
import styles from './node-doc-preview.module.css';

// The code and preview both use the example files in site/demos.
export function NodeDocExample({ id, locale, focus, view, layoutType }: {
  id: NodeDocExampleId;
  locale: Locale;
  focus?: string;
  view?: 'preview' | 'code';
  layoutType?: BuiltInLayoutExample;
}) {
  if (view === 'preview') return <NodeDocPreview id={id} locale={locale} layoutType={layoutType} />;

  let code: string;
  let excerpt: string | undefined;
  if (id === 'built-in-layout') {
    if (!layoutType) throw new Error('Missing built-in layout type');
    ({ code, excerpt } = readBuiltInLayoutExample(layoutType));
  } else {
    code = readNodeDocExample(id);
    excerpt = focus ? getNodeDocExampleSnippet(code, focus) : undefined;
  }
  const codeBlock = excerpt ? (
    <NodeDocCodeTabs
      locale={locale}
      excerpt={excerpt}
      source={code}
      excerptBlock={<ServerCodeBlock lang="ts" code={excerpt} codeblock={{ allowCopy: false }} />}
      sourceBlock={<ServerCodeBlock lang="ts" code={code} codeblock={{ allowCopy: false }} />}
    />
  ) : (
    <ServerCodeBlock lang="ts" code={code} codeblock={{ title: locale === 'zh' ? '完整代码' : 'Complete code' }} />
  );

  if (view === 'code') return <div className={`${styles.code} not-prose`}>{codeBlock}</div>;
  return <NodeDocPreview id={id} locale={locale} layoutType={layoutType}>{codeBlock}</NodeDocPreview>;
}
