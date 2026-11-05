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
  'behavior-selection': () => import('../../demos/docs-behavior-selection.ts'),
  'behavior-highlight': () => import('../../demos/docs-behavior-highlight.ts'),
  'behavior-custom': () => import('../../demos/docs-behavior-custom.ts'),
  'behavior-tooltip': () => import('../../demos/docs-behavior-tooltip.ts'),
  'behavior-tooltip-hover': () => import('../../demos/docs-behavior-tooltip-hover.ts'),
  'events-listen': () => import('../../demos/docs-events-listen.ts'),
  'events-lifecycle': () => import('../../demos/docs-events-lifecycle.ts'),
  'state-concept': () => import('../../demos/docs-state-concept.ts'),
  'state-preserve': () => import('../../demos/docs-state-preserve.ts'),
  'viewport-concept': () => import('../../demos/docs-viewport-concept.ts'),
  'viewport-preserve': () => import('../../demos/docs-viewport-preserve.ts'),
  'state-visibility': () => import('../../demos/docs-state-visibility.ts'),
  'viewport-resize': () => import('../../demos/docs-viewport-resize.ts'),
  'graph-lifecycle': () => import('../../demos/docs-graph-lifecycle.ts'),
  'data-workflow': () => import('../../demos/docs-data-workflow.ts'),
  'combo-operations': () => import('../../demos/docs-combo-operations.ts'),
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
  const hint = id === 'combo-operations'
    ? (zh ? 'Create → Collapse → Expand 比较成员显隐；Move B 只改归属，Remove temp 不删除节点和边；重置恢复初始状态' : 'Create → Collapse → Expand compares member visibility. Move B only changes membership; Remove temp keeps nodes and edges. Reset restores initial data')
    : id === 'data-workflow'
    ? (zh ? 'Edit snapshot 不写回；Update A 更新 score；Add D 新增节点和 C-D，Remove D 同时删除关联边；重置恢复初始数据' : 'Edit snapshot does not write back. Update A changes score. Add D adds D and C-D; Remove D removes both. Reset restores initial data')
    : id === 'graph-lifecycle'
    ? (zh ? '样式更新和 refresh 不增加 render 事件；Render again 重建状态并重新适配；Destroy graph 移除画布，工具栏重置会新建实例' : 'Style updates and refresh do not add render events. Render again rebuilds states and refits. Destroy graph removes the canvas; Reset example creates a new instance')
    : id === 'viewport-resize'
    ? (zh ? '先放大，再点 Width 65% / 100%；虚线框是容器边界，ResizeObserver 同步尺寸并按 autoFit 重新适配；重置恢复原宽度' : 'Zoom first, then choose Width 65% / 100%. The dashed outline marks the container. ResizeObserver updates its size and autoFit refits. Reset restores the original width')
    : id === 'state-visibility'
    ? (zh ? 'Hide A 保留 selected，Show A 只清除 hidden；Hide A + edge 一起隐藏；Clear A 清空 A；Select 同时设置节点、边和 B 所在的 Combo' : 'Hide A keeps selected; Show A removes only hidden. Hide A + edge hides both. Clear A clears A. Select sets states on the node, edge, and B’s Combo')
    : id === 'viewport-preserve'
    ? (zh ? '先缩放或拖动，再对比两种刷新；B 在 x=240 / 800 间切换，Keep view 保留相机，Fit 重新适配；重置恢复初始数据' : 'Zoom or pan, then compare reloads. B alternates between x=240 / 800. Keep view preserves the camera; Fit refits. Reset restores the initial data')
    : id === 'viewport-concept'
    ? (zh ? 'A 的图坐标始终为 (0, 0)；缩放、平移、居中与适配后，比较 A 的画布和浏览器位置；滚轮缩放、空白拖动也可操作' : 'A stays at graph (0, 0). Compare its canvas and client positions after zoom, pan, center, and fit. Wheel zoom and canvas dragging also work')
    : id === 'state-preserve'
    ? (zh ? '单击或 Shift+单击追加选择，悬停查看高亮；Reload 清空选择，Keep selected 只保留新数据中仍存在的已选 ID；重置恢复 A/B/C' : 'Click or Shift-click to select; hover to highlight. Reload clears selection; Keep selected preserves only selected IDs still present. Reset restores A/B/C')
    : id === 'state-concept'
    ? (zh ? 'A 初始 selected；Toggle review 叠加橙色；Replace 只保留 highlight；Clear 清空 A，B 始终作为基础外观对照' : 'A starts selected. Toggle review adds orange; Replace keeps only highlight; Clear removes A’s states. B remains the base-style comparison')
    : id === 'events-lifecycle'
    ? (zh ? 'Update A 修改数据；Add/Remove D 增删节点；Replace data 整体替换；Layout 重排。日志按发生顺序保留最近六行，重置恢复初始渲染事件' : 'Update A, add/remove D, replace data, or run Layout. The log keeps the last six lines in occurrence order; reset restores initial render events')
    : id === 'events-listen'
    ? (zh ? '点击节点、边或空白查看三种坐标；Listening 切换持续监听，Arm once 等待下一次节点点击；监听不会自动选中元素' : 'Click a node, edge, or canvas for coordinates. Toggle Listening, or Arm once for the next node click. Listeners do not select elements')
    : id === 'behavior-tooltip'
    ? (zh ? '单击 API、DB 或边显示；再点相同元素或空白关闭；Cache 节点被 enable 排除' : 'Click API, DB, or an edge; click again or on canvas to close. Cache is excluded by enable')
    : id === 'behavior-tooltip-hover'
    ? (zh ? '悬停 API、DB 或边显示，等待 120ms；移开隐藏，Cache 节点不显示' : 'Hover API, DB, or an edge for 120ms; leaving hides it. Cache nodes show no tooltip')
    : id === 'behavior-custom'
    ? (zh ? '单击节点切换唯一 active；单击空白只清理 active，保留 A 原有的 selected' : 'Click a node to make it uniquely active; canvas click clears active while preserving A’s initial selected state')
    : id === 'behavior-highlight'
    ? (zh ? '悬停 B 查看一度邻域；悬停边查看两端；移开清理高亮，拖动空白平移' : 'Hover B for its one-hop neighborhood, or an edge for its endpoints. Move away to clear; drag empty space to pan')
    : id === 'behavior-selection'
    ? (zh ? '空白处拖拽框选；Shift+单击追加选择；拖动已选节点整体移动；单击空白清空，重置恢复' : 'Drag empty space to brush; Shift-click to add; drag a selected node to move the selection; click empty space to clear')
    : id === 'layout-result'
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
