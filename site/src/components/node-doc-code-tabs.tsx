'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from 'fumadocs-ui/components/ui/tabs';
import { useState, type ReactNode } from 'react';

import type { Locale } from '@/lib/i18n';
import { CopyPrompt } from './ai-skill/copy-prompt';
import styles from './node-doc-preview.module.css';

export function NodeDocCodeTabs({
  locale,
  excerpt,
  source,
  excerptBlock,
  sourceBlock,
}: {
  locale: Locale;
  excerpt: string;
  source: string;
  excerptBlock: ReactNode;
  sourceBlock: ReactNode;
}) {
  const [active, setActive] = useState('excerpt');
  const zh = locale === 'zh';

  return (
    <Tabs className={styles.codeTabs} value={active} onValueChange={setActive}>
      <div className={styles.codeToolbar}>
        <TabsList className={styles.codeTabList} aria-label={zh ? '示例代码' : 'Example code'}>
          <TabsTrigger value="excerpt" className={styles.codeTab}>
            {zh ? '关键代码' : 'Key code'}
          </TabsTrigger>
          <TabsTrigger value="source" className={styles.codeTab}>
            {zh ? '完整代码' : 'Full code'}
          </TabsTrigger>
        </TabsList>
        <CopyPrompt
          key={active}
          className={styles.copyCode}
          text={active === 'excerpt' ? excerpt : source}
          label={zh ? '复制代码' : 'Copy code'}
          copiedLabel={zh ? '已复制' : 'Copied'}
          failedLabel={zh ? '复制失败' : 'Copy failed'}
        />
      </div>
      {/* Keep both highlighted sources in the static HTML for exports and crawlers. */}
      <TabsContent value="excerpt" forceMount hidden={active !== 'excerpt'} tabIndex={-1}>
        {excerptBlock}
      </TabsContent>
      <TabsContent value="source" forceMount hidden={active !== 'source'} tabIndex={-1}>
        {sourceBlock}
      </TabsContent>
    </Tabs>
  );
}
