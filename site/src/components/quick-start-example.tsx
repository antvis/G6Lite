'use client';

import { useEffect, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw, Scan } from 'lucide-react';

import type { Graph } from '../../../src/index.ts';
import type { Locale } from '@/lib/i18n';
import { dataModelExampleOptions } from '@/lib/data-model-example';
import { frameworkGraphData, quickStartNetworkOptions, quickStartOptions } from '@/lib/quick-start';
import styles from './quick-start-example.module.css';

export function QuickStartExample({
  locale,
  variant = 'framework',
}: {
  locale: Locale;
  variant?: 'framework' | 'framework-data' | 'network' | 'data-model';
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [expanded, setExpanded] = useState(false);
  const [counts, setCounts] = useState<{ nodes: number; edges: number } | null>(null);
  const copy =
    locale === 'zh'
      ? {
          title:
            variant === 'network'
              ? '团队协作关系图'
              : variant === 'data-model'
                ? '节点、边与分组'
                : variant === 'framework-data'
                  ? '随数据变化更新的关系图'
                  : '第一个关系图',
          hint:
            variant === 'data-model'
              ? '圆点是节点，连线是边，浅色区域是 Combo'
              : '滚轮缩放 · 拖拽节点 · 悬停高亮',
          loading: '正在加载关系图…',
          error: '关系图加载失败，请检查浏览器是否支持 WebGL。',
          retry: '重新加载',
          reset: '重置示例',
          toolbar: '关系图视口控制',
          fit: '适配画布',
          zoomIn: '放大关系图',
          zoomOut: '缩小关系图',
          basic: '基础关系',
          expanded: '扩展关系',
          dataControls: '切换关系图数据',
          updateHint: '切换数据后，可继续缩放、拖拽和悬停高亮。',
          nodes: '个节点',
          edges: '条关系',
        }
      : {
          title:
            variant === 'network'
              ? 'Team collaboration network'
              : variant === 'data-model'
                ? 'Nodes, edges, and a group'
                : variant === 'framework-data'
                  ? 'Graph data updates'
                  : 'Your first graph',
          hint:
            variant === 'data-model'
              ? 'Dots: nodes · Lines: edges · Shading: Combo'
              : 'Scroll to zoom · Drag nodes · Hover to highlight',
          loading: 'Loading graph…',
          error: 'Unable to load the graph. Check that your browser supports WebGL.',
          retry: 'Retry',
          reset: 'Reset example',
          toolbar: 'Graph viewport controls',
          fit: 'Fit graph',
          zoomIn: 'Zoom in on graph',
          zoomOut: 'Zoom out of graph',
          basic: 'Basic network',
          expanded: 'Extended network',
          dataControls: 'Switch graph data',
          updateHint: 'Switch data, then keep zooming, dragging, and highlighting.',
          nodes: 'nodes',
          edges: 'edges',
        };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let graph: Graph | undefined;
    const start = async () => {
      try {
        const { Graph } = await import('../../../src/index.ts');
        if (disposed) return;
        const options =
          variant === 'network'
            ? quickStartNetworkOptions()
            : variant === 'data-model'
              ? dataModelExampleOptions()
              : quickStartOptions();
        graph = new Graph({ container: mount, ...options });
        const canvas = mount.querySelector('canvas');
        if (canvas) canvas.dataset.previewLayer = 'graph';
        graphRef.current = graph;
        await graph.render();
        if (!disposed) setStatus('ready');
      } catch {
        if (disposed) return;
        graph?.destroy();
        if (graphRef.current === graph) graphRef.current = null;
        mount.replaceChildren();
        setStatus('error');
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        start();
      },
      { rootMargin: '160px' },
    );
    observer.observe(mount);
    return () => {
      disposed = true;
      observer.disconnect();
      graph?.destroy();
      if (graphRef.current === graph) graphRef.current = null;
    };
  }, [attempt, variant]);

  useEffect(() => {
    if (variant !== 'framework-data' || status !== 'ready') return;
    const graph = graphRef.current;
    if (!graph) return;
    let active = true;
    const update = async () => {
      try {
        await graph.setData(frameworkGraphData(expanded), {
          fitView: { padding: 32, maxZoom: 1 },
        });
        if (active) setCounts({ nodes: graph.getNodeCount(), edges: graph.getEdgeCount() });
      } catch {
        if (active) setStatus('error');
      }
    };
    update();
    return () => {
      active = false;
    };
  }, [expanded, status, variant]);

  function reset() {
    setStatus('loading');
    setAttempt((value) => value + 1);
  }

  return (
    <figure
      className={`${styles.preview} docs-example-card not-prose`}
      data-quick-start-preview={status}
      data-framework-nodes={variant === 'framework-data' ? counts?.nodes : undefined}
      data-framework-edges={variant === 'framework-data' ? counts?.edges : undefined}
      aria-label={copy.title}
    >
      {variant === 'framework-data' && (
        <div className={styles.dataControls} role="group" aria-label={copy.dataControls}>
          <button
            type="button"
            aria-pressed={!expanded}
            disabled={status !== 'ready'}
            onClick={() => setExpanded(false)}
          >
            {copy.basic}
          </button>
          <button
            type="button"
            aria-pressed={expanded}
            disabled={status !== 'ready'}
            onClick={() => setExpanded(true)}
          >
            {copy.expanded}
          </button>
          <span role="status">
            {counts && `${counts.nodes} ${copy.nodes} · ${counts.edges} ${copy.edges}`}
          </span>
        </div>
      )}
      <div className={`${styles.viewport} docs-example-card-body`}>
        <div className={styles.canvas} ref={mountRef} role="img" aria-label={copy.title} />
        {status !== 'ready' && (
          <div className={styles.message} role="status">
            {status === 'error' ? copy.error : copy.loading}
          </div>
        )}
        <div className={styles.tools} role="toolbar" aria-label={copy.toolbar}>
          <button
            type="button"
            onClick={() => graphRef.current?.fitView({ padding: 32 })}
            disabled={status !== 'ready'}
            aria-label={copy.fit}
            title={copy.fit}
          >
            <Scan aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => graphRef.current?.zoomBy(1.6)}
            disabled={status !== 'ready'}
            aria-label={copy.zoomIn}
            title={copy.zoomIn}
          >
            <Plus aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => graphRef.current?.zoomBy(0.625)}
            disabled={status !== 'ready'}
            aria-label={copy.zoomOut}
            title={copy.zoomOut}
          >
            <Minus aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={status === 'loading'}
            aria-label={status === 'error' ? copy.retry : copy.reset}
            title={status === 'error' ? copy.retry : copy.reset}
          >
            <RotateCcw aria-hidden="true" />
          </button>
        </div>
      </div>
      <figcaption className="docs-example-card-caption">
        {variant === 'framework-data' ? copy.updateHint : copy.hint}
      </figcaption>
    </figure>
  );
}
