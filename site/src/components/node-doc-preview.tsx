'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { Graph } from '../../../src/index.ts';
import type { Locale } from '@/lib/i18n';
import type { NodeDocExampleId } from '@/lib/node-doc-example-source';
import styles from './node-doc-preview.module.css';

const loaders = {
  style: () => import('../../demos/docs-node-style.ts'),
  labels: () => import('../../demos/docs-node-labels.ts'),
  badges: () => import('../../demos/docs-node-badges.ts'),
};

export function NodeDocPreview({ id, locale, children }: {
  id: NodeDocExampleId;
  locale: Locale;
  children: ReactNode;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const labelId = useId();
  const zh = locale === 'zh';

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let graph: Graph | undefined;
    const start = async () => {
      try {
        const exampleModule = await loaders[id]();
        if (disposed) return;
        const result = await exampleModule.run(mount);
        if (disposed) {
          result.destroy();
          return;
        }
        graph = result;
        setStatus('ready');
      } catch {
        if (!disposed) setStatus('error');
      }
    };
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      void start();
    }, { rootMargin: '160px' });
    observer.observe(mount);
    return () => {
      disposed = true;
      observer.disconnect();
      graph?.destroy();
    };
  }, [id, attempt]);

  return (
    <section className={`${styles.example} not-prose`} aria-labelledby={labelId} data-node-doc-example={id}>
      <div className={styles.header}>
        <strong id={labelId}>{zh ? '效果预览' : 'Live preview'}</strong>
        <span role="status">{status === 'ready' ? (zh ? '运行正常' : 'Running') : status === 'error' ? (zh ? '加载失败' : 'Failed to load') : (zh ? '正在加载' : 'Loading')}</span>
        <button type="button" disabled={status === 'loading'} onClick={() => { setStatus('loading'); setAttempt((value) => value + 1); }}>
          {zh ? '重置示例' : 'Reset example'}
        </button>
      </div>
      <div ref={mountRef} className={styles.canvas} aria-label={zh ? '上文配置的实际渲染效果' : 'Rendered result of the configuration'} />
      {status === 'error' && <p className={styles.error}>{zh ? '请检查浏览器 WebGL 支持后重试。' : 'Check browser WebGL support and retry.'}</p>}
      <div className={styles.code}>{children}</div>
    </section>
  );
}
