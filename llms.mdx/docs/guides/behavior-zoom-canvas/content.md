# 缩放画布 (/docs/guides/behavior-zoom-canvas)





滚动鼠标滚轮，以画布中心为基准缩放。

## 配置方式 [#配置方式]

滚轮速度通过 `sensitivity` 设置，缩放范围通过 `minZoom` 和 `maxZoom` 设置。

## 示例 [#示例]



```ts
const behaviors = [
  { type: 'zoom-canvas', sensitivity: 1.4, minZoom: 0.4, maxZoom: 2 },
  { type: 'drag-canvas', ignoreModifierKeys: true },
] satisfies [BuiltInBehaviorConfig, BuiltInBehaviorConfig];
```

**完整运行代码**

```ts
/**
 * Demo: constrain wheel zoom with sensitivity, minZoom, and maxZoom.
 */
import { Graph, type BuiltInBehaviorConfig } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: string | HTMLElement) {
  // #region navigation
  const behaviors = [
    { type: 'zoom-canvas', sensitivity: 1.4, minZoom: 0.4, maxZoom: 2 },
    { type: 'drag-canvas', ignoreModifierKeys: true },
  ] satisfies [BuiltInBehaviorConfig, BuiltInBehaviorConfig];
  // #endregion navigation
  const [{ minZoom, maxZoom }] = behaviors;
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'a', x: 180, y: 180 },
        { id: 'b', x: 340, y: 120 },
        { id: 'c', x: 340, y: 250 },
        { id: 'd', x: 500, y: 180 },
      ],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'a', target: 'c' },
        { source: 'b', target: 'd' },
        { source: 'c', target: 'd' },
      ],
    },
    node: { style: { size: 28, fill: '#5B8FF9' } },
    behaviors,
  });
  const ui = createDemoPanel(container);
  const report = () => {
    ui.setStatus(`Zoom ${graph.getZoom().toFixed(2)}× · ${minZoom}–${maxZoom}×`);
  };
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  let reportFrame: number | undefined;
  const onWheel = () => {
    if (reportFrame !== undefined) cancelAnimationFrame(reportFrame);
    reportFrame = requestAnimationFrame(() => { reportFrame = undefined; report(); });
  };
  host.addEventListener('wheel', onWheel, { passive: true });

  const fitView = graph.fitView.bind(graph);
  graph.fitView = (options) => { fitView(options); report(); };
  const zoomTo = graph.zoomTo.bind(graph);
  graph.zoomTo = (zoom, options) => { zoomTo(zoom, options); report(); };
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    host.removeEventListener('wheel', onWheel);
    if (reportFrame !== undefined) cancelAnimationFrame(reportFrame);
    ui.destroy();
    destroy();
  };
  try {
    await graph.render();
    ui.addAction(`${minZoom}×`, () => graph.zoomTo(minZoom));
    ui.addAction('1×', () => graph.zoomTo(1));
    ui.addAction(`${maxZoom}×`, () => graph.zoomTo(maxZoom));
    report();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}


export function createDemoPanel(container: string | HTMLElement, description = '') {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

  let gui: GUI | undefined;
  const getGui = () => {
    if (!gui) {
      gui = new GUI({ container: host, width: 160 });
      gui.domElement.classList.add('g6lite-demo-controls');
      gui.domElement.dataset.captureIgnore = '';
      Object.assign(gui.domElement.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: '30',
        maxWidth: 'calc(100% - 20px)',
        maxHeight: 'calc(100% - 20px)',
      });
    }
    return gui;
  };

  let status: HTMLDivElement | undefined;
  const setStatus = (message: string) => {
    if (!status) {
      status = document.createElement('div');
      status.setAttribute('role', 'status');
      status.dataset.role = 'status';
      status.dataset.captureIgnore = '';
      status.style.cssText =
        'position:absolute;left:12px;bottom:10px;z-index:20;max-width:min(28rem,calc(100% - 24px));color:#64748b;font:12px/1.45 system-ui,sans-serif;pointer-events:none;white-space:pre-wrap;';
      host.append(status);
    }
    status.textContent = message;
  };
  if (description) setStatus(description);

  return {
    get gui() {
      return getGui();
    },
    addAction(label: string, action: () => void, folder = getGui()) {
      return folder.add({ [label]: action }, label);
    },
    addChoice<T extends string>(
      label: string,
      choices: readonly T[] | Record<string, T>,
      value: T,
      onChange: (value: T) => void,
    ) {
      const options = Array.isArray(choices) ? [...choices] : choices;
      return getGui().add({ value }, 'value', options).name(label).onChange(onChange);
    },
    setStatus,
    destroy() {
      gui?.destroy();
      status?.remove();
    },
  };
}
```



[参数与默认值](/docs/api/options#导航与拖拽)
