'use client';

import { TabsList, TabsTrigger } from 'fumadocs-ui/components/tabs';
import { Tabs, TabsContent } from 'fumadocs-ui/components/ui/tabs';
import type { Locale } from '@/lib/i18n';
import { NodeDocPreview } from './node-doc-preview';

const examples = [
  { id: 'extension-node', zh: '节点', en: 'Node' },
  { id: 'extension-edge', zh: '边', en: 'Edge' },
  { id: 'extension-decoration', zh: '节点装饰', en: 'Decoration' },
  { id: 'extension-label', zh: '标签渲染', en: 'Label renderer' },
] as const;

export function ElementExtensionExamples({ locale }: { locale: Locale }) {
  return (
    <Tabs defaultValue={examples[0].id}>
      <TabsList
        aria-label={locale === 'zh' ? '元素扩展示例' : 'Element extension examples'}
        className="border-b border-fd-border px-0"
      >
        {examples.map((example) => (
          <TabsTrigger key={example.id} value={example.id}>{example[locale]}</TabsTrigger>
        ))}
      </TabsList>
      {examples.map((example) => (
        <TabsContent key={example.id} value={example.id} className="data-[state=inactive]:hidden">
          <NodeDocPreview id={example.id} locale={locale} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
