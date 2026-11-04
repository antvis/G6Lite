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
  'edge-style': () => import('../../demos/docs-edge-style.ts'),
  'edge-hit-area': () => import('../../demos/docs-edge-hit-area.ts'),
  'edge-parallel': () => import('../../demos/docs-edge-parallel.ts'),
  'edge-curves': () => import('../../demos/docs-edge-curves.ts'),
  'edge-cubic': () => import('../../demos/docs-edge-cubic.ts'),
  'edge-orth': () => import('../../demos/polyline-routing.ts'),
  'edge-indented': () => import('../../demos/docs-edge-indented.ts'),
  'edge-labels': () => import('../../demos/docs-edge-labels.ts'),
  'combo-data': () => import('../../demos/docs-combo-data.ts'),
  'combo-style': () => import('../../demos/docs-combo-style.ts'),
  'combo-collapsed': () => import('../../demos/docs-combo-collapsed.ts'),
  'combo-states': () => import('../../demos/docs-combo-states.ts'),
  'combo-membership': () => import('../../demos/docs-combo-membership.ts'),
  'label-policy': () => import('../../demos/docs-label-policy.ts'),
  'theme-switch': () => import('../../demos/docs-theme-switch.ts'),
  'theme-precedence': () => import('../../demos/docs-theme-precedence.ts'),
  'layout-switch': () => import('../../demos/docs-layout-switch.ts'),
  'layout-tree': () => import('../../demos/docs-layout-tree.ts'),
  'layout-worker': () => import('../../demos/docs-layout-worker.ts'),
  'layout-result': () => import('../../demos/docs-layout-result.ts'),
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
  const hint = id === 'layout-result'
    ? (zh ? '先用 runLayout 计算坐标，再创建未配置 layout 的 Graph 展示结果' : 'Compute positions with runLayout, then display them in a Graph without a layout option')
    : id === 'layout-worker'
    ? (zh ? '运行 Worker 请求，或启动后取消并恢复网格；完成状态不表示未发生主线程回退' : 'Request a Worker layout, or start, cancel, and restore the grid. Completion alone does not prove no main-thread fallback occurred')
    : id === 'layout-tree'
    ? (zh ? '同一棵三层树切换 mindmap、indented、fishbone；重置恢复 mindmap' : 'Switch mindmap, indented, and fishbone on the same three-level tree. Reset restores mindmap')
    : id === 'layout-switch'
    ? (zh ? '同一组数据切换 grid、circular、dagre、force；布局后显式适配，重置恢复 grid' : 'Switch grid, circular, dagre, and force on the same data; fit explicitly after layout. Reset restores grid')
    : id === 'theme-precedence'
    ? (zh ? '两节点均使用显式绿色填充；Selected 使用橙色状态描边，没有继承主题的紫色填充' : 'Both nodes use explicit green fill. Selected has an orange state outline; it does not inherit the theme’s purple state fill')
    : id === 'theme-switch'
    ? (zh ? '切换 light、dark、brand；比较背景、基础样式与状态，重置恢复 light' : 'Switch light, dark, and brand; compare backgrounds, base styles, and states. Reset restores light')
    : id === 'label-policy'
    ? (zh ? '初始 zoom 0.4、固定字号；切换策略，再用放大/缩小比较，重置恢复初始配置' : 'Starts at zoom 0.4 with fixed text size. Toggle policies and zoom to compare; reset restores initial options')
    : id === 'combo-membership'
    ? (zh ? '点击 mobile 切换归属；拖动分组空白处整体移动，拖动节点单独移动' : 'Click mobile to switch groups. Drag group backgrounds to move members together, or drag nodes individually')
    : id === 'combo-collapsed'
    ? (zh ? '从左到右：自动计数、自定义计数、显式标签；点击分组展开或折叠' : 'Auto count, custom count, explicit label. Click a group to expand or collapse')
    : id === 'combo-states'
    ? (zh ? '基础、全局选中、局部选中、多状态叠加；点击分组空白处切换选中' : 'Base, global selection, local selection, combined states. Click group backgrounds to toggle selection')
    : id === 'combo-style'
    ? (zh ? '从左到右：全局样式、局部覆盖、字段回调；缩放对比线宽与几何尺寸' : 'Left to right: global styles, local overrides, field callbacks. Zoom to compare widths and geometry')
    : id === 'combo-data'
    ? (zh ? '左侧嵌套与初始选中；右侧初始折叠，状态来自数据声明' : 'Nested and initially selected on the left; initially collapsed on the right. States come from data')
    : id === 'edge-orth'
    ? (zh ? '拖动画布或滚轮缩放查看路由' : 'Pan or zoom to inspect routes')
    : id.startsWith('edge-')
    ? (zh ? '点击边查看选中样式' : 'Click an edge to inspect its selected style')
    : id === 'badges'
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
        result.getCanvas().dataset.previewLayer = 'graph';
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
      <figure className={`${canvasStyles.preview} ${styles.preview} ${id.startsWith('theme-') ? styles.themePreview : ''} docs-example-card`} aria-label={copy.title}>
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
