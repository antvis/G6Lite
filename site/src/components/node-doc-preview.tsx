'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Minus, Plus, RotateCcw, Scan } from 'lucide-react';
import type { Graph } from '../../../src/index.ts';
import type { Locale } from '@/lib/i18n';
import type { NodeDocExampleId } from '@/lib/node-doc-example-source';
import styles from './node-doc-preview.module.css';
import canvasStyles from './quick-start-example.module.css';

const loaders = {
  body: () => import('../../demos/docs-node-body.ts'),
  style: () => import('../../demos/docs-node-style.ts'),
  labels: () => import('../../demos/docs-node-labels.ts'),
  'label-options': () => import('../../demos/docs-node-label-options.ts'),
  badges: () => import('../../demos/docs-node-badges.ts'),
};

export function NodeDocPreview({ id, locale, children }: {
  id: NodeDocExampleId;
  locale: Locale;
  children: ReactNode;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const labelId = useId();
  const zh = locale === 'zh';
  const copy = zh
    ? { title: '配置效果预览', toolbar: '示例画布控制', fit: '适配画布', zoomIn: '放大', zoomOut: '缩小', reset: '重置示例', loading: '正在加载示例…', running: '运行正常', error: '加载失败，请检查浏览器 WebGL 支持后重试。' }
    : { title: 'Configuration preview', toolbar: 'Example canvas controls', fit: 'Fit graph', zoomIn: 'Zoom in', zoomOut: 'Zoom out', reset: 'Reset example', loading: 'Loading example…', running: 'Running', error: 'Unable to load. Check browser WebGL support and retry.' };
  const hint = id === 'badges'
    ? (zh ? '悬停 ··· 展开徽章' : 'Hover ··· to expand badges')
    : id === 'body' || id === 'style'
      ? (zh ? '点击节点查看选中样式' : 'Click a node to inspect its selected style')
      : (zh ? '标签与图标独立配置' : 'Labels and icons are configured independently');

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
        graphRef.current = result;
        const canvas = mount.querySelector('canvas');
        if (canvas) canvas.dataset.previewLayer = 'graph';
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
      if (graphRef.current === graph) graphRef.current = null;
    };
  }, [id, attempt]);

  return (
    <section className={`${styles.example} not-prose`} aria-labelledby={labelId} data-node-doc-example={id} data-node-doc-status={status}>
      <figure className={`${canvasStyles.preview} ${styles.preview} docs-example-card`} aria-label={copy.title}>
        <div className={`${canvasStyles.viewport} docs-example-card-body`}>
          <div ref={mountRef} className={canvasStyles.canvas} aria-label={zh ? '上文配置的实际渲染效果' : 'Rendered result of the configuration'} />
          {status !== 'ready' && <div className={canvasStyles.message} role="status">{status === 'error' ? copy.error : copy.loading}</div>}
          {status === 'ready' && <span className="sr-only" role="status">{copy.running}</span>}
          <div className={canvasStyles.tools} role="toolbar" aria-label={copy.toolbar}>
            <button type="button" onClick={() => graphRef.current?.fitView({ padding: 48, maxZoom: 1 })} disabled={status !== 'ready'} aria-label={copy.fit} title={copy.fit}>
              <Scan aria-hidden="true" />
            </button>
            <button type="button" onClick={() => graphRef.current?.zoomBy(1.6)} disabled={status !== 'ready'} aria-label={copy.zoomIn} title={copy.zoomIn}>
              <Plus aria-hidden="true" />
            </button>
            <button type="button" onClick={() => graphRef.current?.zoomBy(0.625)} disabled={status !== 'ready'} aria-label={copy.zoomOut} title={copy.zoomOut}>
              <Minus aria-hidden="true" />
            </button>
            <button type="button" disabled={status === 'loading'} onClick={() => { setStatus('loading'); setAttempt((value) => value + 1); }} aria-label={copy.reset} title={copy.reset}>
              <RotateCcw aria-hidden="true" />
            </button>
          </div>
        </div>
        <figcaption id={labelId} className="docs-example-card-caption">{hint}</figcaption>
      </figure>
      <div className={styles.code}>{children}</div>
    </section>
  );
}
