# 自定义边 (/docs/guides/custom-edge)





用 `EdgeExtension` 为一类业务关系封装可复用的边类型。边的路径由 `base` 决定，方向由箭头表示，文字由 `edge.style.label` 提供。只需在一张图里按数据改变线宽或颜色时，可以直接用[样式函数](/docs/guides/edge#样式函数)。

## 注册与启用 [#注册与启用]

选择 `arc` 作为路径基型，用 `getStyle()` 按权重决定颜色和线宽，再用 `register('edge', ...)` 注册类型。



```ts
const weightedEdge: EdgeExtension = {
  base: 'arc',
  style: { curvature: 0.2, endArrow: true, hitAreaWidth: 14 },
  getStyle(_source, _target, edge) {
    const weight = Number(edge.data?.weight ?? 1);
    return { stroke: weight > 2 ? '#cf1322' : '#5366ad', lineWidth: weight + 1 };
  },
  stateStyles: { selected: { stroke: '#873bf4', lineWidth: 4 } },
};
register('edge', 'docs-weighted-edge', weightedEdge);
```

**完整运行代码**

```ts
import { Graph, register, type EdgeExtension } from '@antv/g6-lite';
import GUI from 'lil-gui';

// #region descriptor
const weightedEdge: EdgeExtension = {
  base: 'arc',
  style: { curvature: 0.2, endArrow: true, hitAreaWidth: 14 },
  getStyle(_source, _target, edge) {
    const weight = Number(edge.data?.weight ?? 1);
    return { stroke: weight > 2 ? '#cf1322' : '#5366ad', lineWidth: weight + 1 };
  },
  stateStyles: { selected: { stroke: '#873bf4', lineWidth: 4 } },
};
register('edge', 'docs-weighted-edge', weightedEdge);
// #endregion descriptor

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 190, y: 80 }, { id: 'C', x: 380, y: 0 }],
      edges: [
        { id: 'light', source: 'A', target: 'B', data: { weight: 1 } },
        { id: 'heavy', source: 'B', target: 'C', data: { weight: 4 } },
      ],
    },
    node: { style: { size: 28, label: (node) => node.id } },
    // #region edge-activation
    edge: { type: 'docs-weighted-edge', style: { label: (_s, _t, edge) => edge.id ?? '' } },
    // #endregion edge-activation
    behaviors: ['click-select', 'zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 64, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); destroy(); };
  try {
    await graph.render();
    // #region edge-weight-update
    ui.addAction('Toggle heavy weight', () => {
      const weight = graph.getEdgeData('heavy')?.data?.weight === 4 ? 1 : 4;
      graph.updateEdgeData('heavy', { weight });
    });
    // #endregion edge-weight-update
    return graph;
  }
  catch (error) { graph.destroy(); throw error; }
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



在 `new Graph()` 中把 `edge.type` 设为注册名。下例中 `light` 的初始权重为 `1`，`heavy` 为 `4`。



```ts
edge: { type: 'docs-weighted-edge', style: { label: (_s, _t, edge) => edge.id ?? '' } },
```

**完整运行代码**

```ts
import { Graph, register, type EdgeExtension } from '@antv/g6-lite';
import GUI from 'lil-gui';

// #region descriptor
const weightedEdge: EdgeExtension = {
  base: 'arc',
  style: { curvature: 0.2, endArrow: true, hitAreaWidth: 14 },
  getStyle(_source, _target, edge) {
    const weight = Number(edge.data?.weight ?? 1);
    return { stroke: weight > 2 ? '#cf1322' : '#5366ad', lineWidth: weight + 1 };
  },
  stateStyles: { selected: { stroke: '#873bf4', lineWidth: 4 } },
};
register('edge', 'docs-weighted-edge', weightedEdge);
// #endregion descriptor

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 190, y: 80 }, { id: 'C', x: 380, y: 0 }],
      edges: [
        { id: 'light', source: 'A', target: 'B', data: { weight: 1 } },
        { id: 'heavy', source: 'B', target: 'C', data: { weight: 4 } },
      ],
    },
    node: { style: { size: 28, label: (node) => node.id } },
    // #region edge-activation
    edge: { type: 'docs-weighted-edge', style: { label: (_s, _t, edge) => edge.id ?? '' } },
    // #endregion edge-activation
    behaviors: ['click-select', 'zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 64, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); destroy(); };
  try {
    await graph.render();
    // #region edge-weight-update
    ui.addAction('Toggle heavy weight', () => {
      const weight = graph.getEdgeData('heavy')?.data?.weight === 4 ? 1 : 4;
      graph.updateEdgeData('heavy', { weight });
    });
    // #endregion edge-weight-update
    return graph;
  }
  catch (error) { graph.destroy(); throw error; }
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



## 覆盖与更新 [#覆盖与更新]

在上方示例点击 **Toggle heavy weight**，`updateEdgeData()` 会更新 `heavy` 的权重，`getStyle()` 随之调整颜色和线宽。点击边可查看紫色选中样式，点击空白处可恢复基础样式。



```ts
ui.addAction('Toggle heavy weight', () => {
  const weight = graph.getEdgeData('heavy')?.data?.weight === 4 ? 1 : 4;
  graph.updateEdgeData('heavy', { weight });
});
```

**完整运行代码**

```ts
import { Graph, register, type EdgeExtension } from '@antv/g6-lite';
import GUI from 'lil-gui';

// #region descriptor
const weightedEdge: EdgeExtension = {
  base: 'arc',
  style: { curvature: 0.2, endArrow: true, hitAreaWidth: 14 },
  getStyle(_source, _target, edge) {
    const weight = Number(edge.data?.weight ?? 1);
    return { stroke: weight > 2 ? '#cf1322' : '#5366ad', lineWidth: weight + 1 };
  },
  stateStyles: { selected: { stroke: '#873bf4', lineWidth: 4 } },
};
register('edge', 'docs-weighted-edge', weightedEdge);
// #endregion descriptor

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 190, y: 80 }, { id: 'C', x: 380, y: 0 }],
      edges: [
        { id: 'light', source: 'A', target: 'B', data: { weight: 1 } },
        { id: 'heavy', source: 'B', target: 'C', data: { weight: 4 } },
      ],
    },
    node: { style: { size: 28, label: (node) => node.id } },
    // #region edge-activation
    edge: { type: 'docs-weighted-edge', style: { label: (_s, _t, edge) => edge.id ?? '' } },
    // #endregion edge-activation
    behaviors: ['click-select', 'zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 64, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); destroy(); };
  try {
    await graph.render();
    // #region edge-weight-update
    ui.addAction('Toggle heavy weight', () => {
      const weight = graph.getEdgeData('heavy')?.data?.weight === 4 ? 1 : 4;
      graph.updateEdgeData('heavy', { weight });
    });
    // #endregion edge-weight-update
    return graph;
  }
  catch (error) { graph.destroy(); throw error; }
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



样式优先级和扩展字段见 [EdgeExtension](/docs/api/extensions#edgeextension)。

## 常见问题 [#常见问题]

### 能实现任意自定义 draw 或 WebGL shader 吗？ [#能实现任意自定义-draw-或-webgl-shader-吗]

当前 EdgeExtension 只有基型、默认样式、getStyle 与状态样式，没有任意 draw / shader 钩子。完整签名查[EdgeExtension](/docs/api/extensions#edgeextension)。

### 为什么标签没有显示？ [#为什么标签没有显示]

扩展默认边样式不替代标签启用配置。本例在 edge.style 显式提供 label；只把文字放入 data 或扩展描述不保证激活标签遍历。

### 为什么边难以选中？ [#为什么边难以选中]

配置 `hitAreaWidth` 并启用交互。本例热区为 14，线宽保持原样。完整规则见[交互热区](/docs/guides/edge#交互热区)。

注册、缓存和错误边界查[公共契约](/docs/api/graph#extension-registration)。
