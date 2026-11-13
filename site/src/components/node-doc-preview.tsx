'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Minus, Plus, RotateCcw, Scan } from 'lucide-react';
import type { Graph } from '../../../src/index.ts';
import type { BuiltInLayoutExample } from '../../demos/docs-built-in-layout.ts';
import type { Locale } from '@/lib/i18n';
import type { NodeDocExampleId } from '@/lib/node-doc-example-source';
import styles from './node-doc-preview.module.css';
import canvasStyles from './quick-start-example.module.css';

function loadIndividualBehavior(name: keyof typeof import('../../demos/docs-individual-behaviors.ts').configurations) {
  return async () => {
    const { configurations, run } = await import('../../demos/docs-individual-behaviors.ts');
    return { run: (container: HTMLElement) => run(container, configurations[name]) };
  };
}

const loaders = {
  'parallel-workflow': () => import('../../demos/docs-parallel-workflow.ts'),
  'self-loops': () => import('../../demos/docs-self-loops.ts'),
  'extension-plugin': () => import('../../demos/docs-extension-plugin.ts'),
  'extension-transform': () => import('../../demos/docs-extension-transform.ts'),
  'extension-layout': () => import('../../demos/docs-extension-layout.ts'),
  'extension-decoration': () => import('../../demos/docs-extension-decoration.ts'),
  'extension-label': () => import('../../demos/custom-label-renderer.ts'),
  'extension-edge': () => import('../../demos/docs-extension-edge.ts'),
  'extension-node': () => import('../../demos/docs-extension-node.ts'),
  'breathing-node': () => import('../../demos/breathing-node.ts'),
  body: () => import('../../demos/docs-node-body.ts'),
  style: () => import('../../demos/docs-node-style.ts'),
  labels: () => import('../../demos/docs-node-labels.ts'),
  'node-icons': () => import('../../demos/docs-node-icons.ts'),
  'node-halo': () => import('../../demos/docs-node-halo.ts'),
  'node-updates': () => import('../../demos/docs-node-updates.ts'),
  'label-options': () => import('../../demos/docs-node-label-options.ts'),
  badges: () => import('../../demos/docs-node-badges.ts'),
  'edge-style': () => import('../../demos/docs-edge-style.ts'),
  'edge-arrows': async () => ({ run: (await import('../../demos/edge-arrows.ts')).runGraph }),
  'edge-state-styles': () => import('../../demos/docs-edge-state-styles.ts'),
  'edge-updates': () => import('../../demos/docs-edge-updates.ts'),
  'edge-hit-area': () => import('../../demos/docs-edge-hit-area.ts'),
  'edge-dashes': () => import('../../demos/docs-edge-dashes.ts'),
  'edge-parallel': () => import('../../demos/docs-edge-parallel.ts'),
  'edge-curves': () => import('../../demos/docs-edge-curves.ts'),
  'edge-cubic': () => import('../../demos/docs-edge-cubic.ts'),
  'edge-orth': () => import('../../demos/polyline-routing.ts'),
  'polyline-orth': () => import('../../demos/docs-polyline-orth.ts'),
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
  'built-in-layout': () => import('../../demos/docs-built-in-layout.ts'),
  'layout-networks': () => import('../../demos/docs-layout-networks.ts'),
  'layout-tree': () => import('../../demos/docs-layout-tree.ts'),
  'layout-worker': () => import('../../demos/docs-layout-worker.ts'),
  'layout-result': () => import('../../demos/docs-layout-result.ts'),
  'behavior-switch': () => import('../../demos/docs-behavior-switch.ts'),
  'behavior-zoom-pan': () => import('../../demos/zoom-options.ts'),
  'demo-drag-canvas': loadIndividualBehavior('drag-canvas'),
  'demo-click-select': loadIndividualBehavior('click-select'),
  'demo-brush-select': loadIndividualBehavior('brush-select'),
  'demo-lasso-select': loadIndividualBehavior('lasso-select'),
  'demo-highlight-node': loadIndividualBehavior('highlight-node'),
  'demo-highlight-edge': loadIndividualBehavior('highlight-edge'),
  'behavior-drag-node': () => import('../../demos/drag-node.ts'),
  'behavior-drag-edge': () => import('../../demos/drag-edge.ts'),
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
  'viewport-zoom-to': async () => ({ run: (await import('../../demos/docs-viewport-zoom.ts')).runZoomTo }),
  'viewport-zoom-by': async () => ({ run: (await import('../../demos/docs-viewport-zoom.ts')).runZoomBy }),
  'graph-lifecycle': () => import('../../demos/docs-graph-lifecycle.ts'),
  'graph-options': () => import('../../demos/docs-graph-options.ts'),
  'data-workflow': () => import('../../demos/docs-data-workflow.ts'),
  'combo-operations': () => import('../../demos/docs-combo-operations.ts'),
  'dependency-graph': () => import('../../demos/dependency-graph.ts'),
};

export function NodeDocPreview({ id, locale, layoutType, children }: {
  id: NodeDocExampleId;
  locale: Locale;
  layoutType?: BuiltInLayoutExample;
  children?: ReactNode;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const labelId = useId();
  const zh = locale === 'zh';
  const isZoomExample = id === 'viewport-zoom-to' || id === 'viewport-zoom-by';
  const copy = zh
    ? { title: '配置效果预览', toolbar: '示例画布控制', fit: '适配画布', zoomIn: '放大', zoomOut: '缩小', reset: '重置示例', loading: '正在加载示例…', running: '运行正常', error: '加载失败，请检查浏览器 WebGL 支持后重试。' }
    : { title: 'Configuration preview', toolbar: 'Example canvas controls', fit: 'Fit graph', zoomIn: 'Zoom in', zoomOut: 'Zoom out', reset: 'Reset example', loading: 'Loading example…', running: 'Running', error: 'Unable to load. Check browser WebGL support and retry.' };
  const hint = id === 'graph-options'
    ? (zh ? '点击节点查看选中样式，拖动空白处平移，滚轮缩放。' : 'Click a node to see its selected style. Drag empty space to pan or scroll to zoom.')
    : id === 'parallel-workflow'
    ? (zh ? '切换分离和间距，观察平行边变化。B 的自环大小保持不变。' : 'Toggle separation and spacing to see the parallel edges change. The self-loop on B keeps its size.')
    : id === 'self-loops'
    ? (zh ? 'A 为单自环，B 为三个自环；平行边分离已关闭，自环仍分层；拖动节点观察环与标签跟随' : 'One self-loop on A, three on B. Loops remain nested with parallel separation disabled. Drag nodes to see loops and labels follow')
    : id === 'extension-plugin'
    ? (zh ? "按钮或节点点击加一；Render again 重挂载并归零，重复后一次节点点击仍只加一" : "Button or node clicks increment once. Render again remounts at zero; repeated remounts must not duplicate subscriptions")
    : id === 'extension-transform'
    ? (zh ? "Reload data 增加 update/run 但不增加 init；Update name 不重跑 Transform，也不重新生成 label；重置清零" : "Reload data increments update/run without another init. Update name does not rerun the transform or regenerate labels. Reset clears counters")
    : id === 'extension-layout'
    ? (zh ? "先启动 Slow layout，再立即 Cancel + grid；旧结果不会覆盖网格；Layout again 恢复列布局" : "Start Slow layout then immediately Cancel + grid. Old results cannot replace the grid. Layout again restores the column")
    : id === 'extension-decoration'
    ? (zh ? "A 有五项，默认两项及 +3；悬停装饰区域展开，移开恢复；B 为单项对照" : "A has five items, initially two plus +3. Hover decorations to expand; leave to collapse. B is a single-item comparison")
    : id === 'extension-label'
    ? (zh ? "同一 renderer 绘制节点与边的两行内容；拖动节点或缩放，比较背景与定位；重置恢复" : "One renderer draws two-line node and edge labels. Drag nodes or zoom to inspect backgrounds and placement. Reset restores input")
    : id === 'extension-edge'
    ? (zh ? "单击边选中；切换 heavy 权重，先清理选择再比较基础外观；重置恢复" : "Click an edge to select. Toggle heavy weight; clear selection to compare base styles. Reset restores weights")
    : id === 'extension-node'
    ? (zh ? "切换 B 业务状态，单击节点选中；短条为覆盖绘制，右上徽章使用自定义装饰锚点；重置恢复" : "Toggle B status; click to select. Stripes are overlays; upper-right badges use custom decoration anchors. Reset restores input")
    : id === 'breathing-node'
    ? (zh ? '对比选中、高亮和普通节点的呼吸效果' : 'Compare the pulse on selected, highlighted, and normal nodes')
    : id === 'polyline-orth'
    ? (zh ? '用 Radius 切换直角和圆角，用 Direction 切换从左到右和从上到下。' : 'Use Radius to compare square and rounded corners. Use Direction to switch between left-to-right and top-to-bottom.')
    : id === 'combo-operations'
    ? (zh ? 'Create → Collapse → Expand 比较成员显隐；Move B 只改归属，Remove temp 不删除节点和边；重置恢复初始状态' : 'Create → Collapse → Expand compares member visibility. Move B only changes membership; Remove temp keeps nodes and edges. Reset restores initial data')
    : id === 'data-workflow'
    ? (zh ? 'Edit snapshot 不写回；Update A 更新 score；Add D 新增节点和 C-D，Remove D 同时删除关联边；重置恢复初始数据' : 'Edit snapshot does not write back. Update A changes score. Add D adds D and C-D; Remove D removes both. Reset restores initial data')
    : id === 'graph-lifecycle'
    ? (zh ? '改变颜色和大小时，渲染事件计数保持原值。Render again 会重建状态并重新适配，Destroy graph 会移除画布。' : 'Changing color and size keeps the render event count unchanged. Render again rebuilds state and refits. Destroy graph removes the canvas.')
    : id === 'viewport-resize'
    ? (zh ? '先放大，再点 Width 65% / 100%；虚线框是容器边界，ResizeObserver 同步尺寸并按 autoFit 重新适配；重置恢复原宽度' : 'Zoom first, then choose Width 65% / 100%. The dashed outline marks the container. ResizeObserver updates its size and autoFit refits. Reset restores the original width')
    : id === 'viewport-zoom-to'
    ? (zh ? '点击 zoomTo(1.5)，缩放从 2 变为 1.5。center 设为节点 A 的浏览器坐标，缩放时 A 留在原位。' : 'Click zoomTo(1.5) to change the zoom from 2 to 1.5. The center option anchors the zoom at node A’s position in the browser.')
    : id === 'viewport-zoom-by'
    ? (zh ? '点击 zoomBy(1.5)，缩放从 2 变为 3。再点一次时，maxZoom 会把缩放限制在 4。' : 'Click zoomBy(1.5) to change the zoom from 2 to 3. On the next click, maxZoom caps the zoom at 4.')
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
    : id === 'behavior-zoom-pan'
    ? (zh ? '滚轮缩放，拖动空白处平移。' : 'Scroll to zoom or drag empty space to pan.')
    : id === 'demo-drag-canvas'
    ? (zh ? '用鼠标左键拖动画布空白处。' : 'Drag empty canvas space with the left mouse button.')
    : id === 'demo-click-select'
    ? (zh ? '点击节点或边，按住 Shift 可追加选择。' : 'Click a node or edge. Hold Shift to add to the selection.')
    : id === 'demo-brush-select'
    ? (zh ? '按住 Shift 拖出一个矩形框。' : 'Hold Shift and drag a selection rectangle.')
    : id === 'demo-lasso-select'
    ? (zh ? '按住 Ctrl 或 ⌘ 拖动，沿节点外围画一圈。' : 'Hold Ctrl or Command and draw around the nodes.')
    : id === 'demo-highlight-node'
    ? (zh ? '把鼠标移到 B 上，观察相邻节点和边。' : 'Hover over B to highlight its neighbors and connecting edges.')
    : id === 'demo-highlight-edge'
    ? (zh ? '把鼠标移到 D 与 E 之间的边上，观察两个端点。' : 'Hover over the edge between D and E to highlight its endpoints.')
    : id === 'behavior-drag-node'
    ? (zh ? '拖动节点，或拖动分组内的空白处。按住 Shift 点击可追加选择。' : 'Drag a node or the background inside a combo. Shift-click to add to the selection.')
    : id === 'behavior-drag-edge'
    ? (zh ? '从 A 到 B 的边靠近 B 的位置开始拖动，在 C 上松开。' : 'Start on the A–B edge near B, then release on C.')
    : id === 'layout-result'
    ? (zh ? '先用 runLayout 计算坐标，再创建未配置 layout 的 Graph 展示结果' : 'Compute positions with runLayout, then display them in a Graph without a layout option')
    : id === 'layout-worker'
    ? (zh ? '运行 Worker 请求，或启动后取消并恢复网格；完成状态不表示未发生主线程回退' : 'Request a Worker layout, or start, cancel, and restore the grid. Completion alone does not prove no main-thread fallback occurred')
    : id === 'layout-tree'
    ? (zh ? '同一棵三层树切换 mindmap、indented、fishbone；重置恢复 mindmap' : 'Switch mindmap, indented, and fishbone on the same three-level tree. Reset restores mindmap')
    : id === 'dependency-graph'
    ? (zh ? '悬停服务查看相邻节点和调用关系，滚轮缩放，拖动空白处平移' : 'Hover a service to see its neighbors and calls. Scroll to zoom or drag empty space to pan')
    : id === 'layout-switch'
    ? (zh ? '切换 Layout，对比同一张图的网格、环形和层级布局。' : 'Use Layout to compare grid, circular, and layered arrangements of the same graph.')
    : id === 'layout-networks'
    ? (zh ? '紫色节点是 0。切换 Layout，观察它和其他节点的位置变化。' : 'Node 0 is purple. Switch Layout to see how it and the other nodes move.')
    : id === 'built-in-layout'
    ? (zh ? '拖动画布平移，滚轮缩放。' : 'Drag to pan or scroll to zoom.')
    : id === 'theme-precedence'
    ? (zh ? '两节点均使用显式绿色填充；Selected 使用橙色状态描边，没有继承主题的紫色填充' : 'Both nodes use explicit green fill. Selected has an orange state outline; it does not inherit the theme’s purple state fill')
    : id === 'theme-switch'
    ? (zh ? '切换 light、dark、brand；比较背景、基础样式与状态，重置恢复 light' : 'Switch light, dark, and brand; compare backgrounds, base styles, and states. Reset restores light')
    : id === 'label-policy'
    ? (zh ? '初始 zoom 0.4、固定字号；切换策略，再用放大/缩小比较，重置恢复初始配置' : 'Starts at zoom 0.4 with fixed text size. Toggle policies and zoom to compare; reset restores initial options')
    : id === 'combo-membership'
    ? (zh ? '点击 mobile 换组，拖动分组内的空白处移动整组。' : 'Click mobile to switch groups. Drag the empty space inside a group to move it.')
    : id === 'combo-collapsed'
    ? (zh ? '从左到右：自动计数、自定义计数、显式标签；点击分组展开或折叠' : 'Auto count, custom count, explicit label. Click a group to expand or collapse')
    : id === 'combo-states'
    ? (zh ? '基础、全局选中、局部选中、多状态叠加；点击分组空白处切换选中' : 'Base, global selection, local selection, combined states. Click group backgrounds to toggle selection')
    : id === 'combo-style'
    ? (zh ? '从左到右依次展示默认样式、单组样式和由样式函数生成的标签。' : 'From left to right: default styles, a per-combo override, and a label from a style function.')
    : id === 'combo-data'
    ? (zh ? '左侧的紫色边框表示 Client 已选中，右侧的 Archive 处于折叠状态。' : 'The purple outline marks Client as selected. Archive starts collapsed.')
    : id === 'edge-orth'
    ? (zh ? '拖动画布或滚轮缩放查看路由' : 'Pan or zoom to inspect routes')
    : id === 'edge-state-styles'
    ? (zh ? '点击一条边切换紫色选中样式' : 'Click an edge to apply the purple selection style')
    : id === 'edge-updates'
    ? (zh ? '更新 SQL 边的延迟，或修改所有边的颜色' : 'Update SQL latency or set a shared edge color')
    : id === 'edge-style'
    ? (zh ? '对比数据映射生成的线宽、颜色、虚线和箭头' : 'Compare data-driven widths, colors, dashes, and arrows')
    : id === 'edge-arrows'
    ? (zh ? '对比无箭头、单向箭头、双向箭头和粗线箭头' : 'Compare edges with no arrow, one arrow, arrows at both ends, and a wider line')
    : id === 'edge-labels'
    ? (zh ? '对比标签位置及有无底色的效果' : 'Compare label positions and backgrounds')
    : id === 'edge-dashes'
    ? (zh ? '从上到下：实线、短周期虚线、长周期虚线' : 'From top to bottom: solid line, short dashes, long dashes')
    : id === 'edge-hit-area'
    ? (zh ? '在线条旁点击，比较上方 2 像素与下方 24 像素热区' : 'Click beside each line to compare the upper 2-pixel and lower 24-pixel hit areas')
    : id.startsWith('edge-')
    ? (zh ? '点击边查看选中样式' : 'Click an edge to inspect its selected style')
    : id === 'badges'
    ? (zh ? '悬停 ··· 展开徽章' : 'Hover ··· to expand badges')
    : id === 'style'
      ? (zh ? '点击节点查看选中样式。用 B: 28 / 40 改大小，用 Fill 改填充色。' : 'Click a node to see its selected style. Use B: 28 / 40 to change its size and Fill to change the colors.')
    : id === 'body'
      ? (zh ? '点击节点查看选中样式' : 'Click a node to inspect its selected style')
    : id === 'labels'
      ? (zh ? '从左到右依次展示左侧标签、ID 回退、右侧标签与隐藏标签' : 'From left to right: left placement, ID fallback, right placement, and a hidden label')
    : id === 'label-options'
      ? (zh ? '对比两种底色与内边距，观察长标签截断' : 'Compare two backgrounds and padding, and see how the long label is truncated')
    : id === 'node-icons'
      ? (zh ? '左侧使用文字图标，右侧使用图片图标' : 'A text icon on the left and an image icon on the right')
    : id === 'node-halo'
      ? (zh ? '从左到右：默认、激活、选中' : 'From left to right: default, active, selected')
    : id === 'node-updates'
      ? (zh ? '更新 DB 的数据，或调整所有节点的标签位置' : 'Update DB’s data or move all node labels')
      : (zh ? '标签与图标独立配置' : 'Labels and icons are configured independently');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let graph: Graph | undefined;
    const start = async () => {
      try {
        const load = id === 'built-in-layout'
          ? async () => {
              if (!layoutType) throw new Error('Missing built-in layout type');
              const { run } = await loaders[id]();
              return { run: (container: HTMLElement) => run(container, layoutType) };
            }
          : loaders[id];
        const exampleModule = await load();
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
  }, [id, attempt, layoutType]);

  return (
    <section className={`${styles.example} not-prose`} aria-labelledby={labelId} data-node-doc-example={id} data-node-doc-status={status}>
      <figure className={`${canvasStyles.preview} ${styles.preview} docs-example-card`} aria-label={copy.title}>
        <div className={`${canvasStyles.viewport} docs-example-card-body`}>
          <div ref={mountRef} className={canvasStyles.canvas} aria-label={zh ? '上文配置的实际渲染效果' : 'Rendered result of the configuration'} />
          {status !== 'ready' && <div className={canvasStyles.message} role="status">{status === 'error' ? copy.error : copy.loading}</div>}
          {status === 'ready' && <span className="sr-only" role="status">{copy.running}</span>}
          <div className={canvasStyles.tools} role="toolbar" aria-label={copy.toolbar}>
            {!isZoomExample && (
              <>
                <button type="button" onClick={() => graphRef.current?.fitView({ padding: 48, maxZoom: 1 })} disabled={status !== 'ready'} aria-label={copy.fit} title={copy.fit}>
                  <Scan aria-hidden="true" />
                </button>
                <button type="button" onClick={() => graphRef.current?.zoomBy(1.6)} disabled={status !== 'ready'} aria-label={copy.zoomIn} title={copy.zoomIn}>
                  <Plus aria-hidden="true" />
                </button>
                <button type="button" onClick={() => graphRef.current?.zoomBy(0.625)} disabled={status !== 'ready'} aria-label={copy.zoomOut} title={copy.zoomOut}>
                  <Minus aria-hidden="true" />
                </button>
              </>
            )}
            <button type="button" disabled={status === 'loading'} onClick={() => { setStatus('loading'); setAttempt((value) => value + 1); }} aria-label={copy.reset} title={copy.reset}>
              <RotateCcw aria-hidden="true" />
            </button>
          </div>
        </div>
        <figcaption id={labelId} className="docs-example-card-caption">{hint}</figcaption>
      </figure>
      {children && <div className={styles.code}>{children}</div>}
    </section>
  );
}
