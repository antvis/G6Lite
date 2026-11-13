# 自定义节点 (/docs/guides/custom-node)





用 `NodeExtension` 封装可复用的节点外观。颜色和尺寸也可以直接在[节点配置](/docs/guides/node#options-node)中设置。

## 适用场景 [#适用场景]

1. 选 circle / rect 基型，保留内置绘制和拾取。
2. 定义默认 style、纯函数 getStyle，首次 render 前 register。
3. 配置 node.type 激活；运行中通过公开数据方法更新业务字段。

## 覆盖绘制与边界锚点 [#覆盖绘制与边界锚点]

`drawOverlay()` 在节点左侧画短条。`getBoundaryAnchor()` 将右侧徽章从节点中心向上移四分之一节点高度。点击 **Toggle B status**，可以看到 B 切换状态时短条和徽章仍跟随节点。



```ts
drawOverlay(ctx, { x, y, zoom }) {
  ctx.save();
  ctx.fillStyle = '#5366ad';
  ctx.fillRect(x - 44 * zoom, y - 12 * zoom, 4 * zoom, 24 * zoom);
  ctx.restore();
},
getBoundaryAnchor({ placement, width, height, crossOffsetRatio }) {
  if (placement === 'right') return { x: width / 2, y: -height / 4 };
  if (placement === 'left') return { x: -width / 2, y: height * crossOffsetRatio };
  return { x: width * crossOffsetRatio, y: placement === 'top' ? -height / 2 : height / 2 };
},
```

**完整运行代码**

```ts
import { Graph, register, type NodeExtension } from '@antv/g6-lite';
import GUI from 'lil-gui';

// #region descriptor
const statusNode: NodeExtension = {
  base: 'rect',
  style: { size: 40, width: 100, height: 40, borderRadius: 6, strokeWidth: 2 },
  getStyle(node) {
    return node.data?.status === 'error'
      ? { fill: '#fff1f0', stroke: '#cf1322' }
      : { fill: '#e6f4ff', stroke: '#1677ff' };
  },
  // #region overlay-and-anchor
  drawOverlay(ctx, { x, y, zoom }) {
    ctx.save();
    ctx.fillStyle = '#5366ad';
    ctx.fillRect(x - 44 * zoom, y - 12 * zoom, 4 * zoom, 24 * zoom);
    ctx.restore();
  },
  getBoundaryAnchor({ placement, width, height, crossOffsetRatio }) {
    if (placement === 'right') return { x: width / 2, y: -height / 4 };
    if (placement === 'left') return { x: -width / 2, y: height * crossOffsetRatio };
    return { x: width * crossOffsetRatio, y: placement === 'top' ? -height / 2 : height / 2 };
  },
  // #endregion overlay-and-anchor
};
register('node', 'docs-status-node', statusNode);
// #endregion descriptor

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 0, y: 0, data: { status: 'ok' } },
        { id: 'B', x: 240, y: 0, data: { status: 'error' } },
      ],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: {
      type: 'docs-status-node',
      style: { label: (node) => node.id, labelPlacement: 'center', labelColor: '#1f2937' },
      stateStyles: { selected: { stroke: '#873bf4', strokeWidth: 4 } },
      decorations: [{ renderer: 'builtin-badge', placement: 'right', attachment: 'boundary', data: { kind: 'count', value: 3 } }],
    },
    edge: { style: { endArrow: true } },
    behaviors: ['click-select', 'zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 64, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); destroy(); };
  try {
    await graph.render();
    ui.addAction('Toggle B status', () => {
      const status = graph.getNodeData('B')?.data?.status === 'error' ? 'ok' : 'error';
      graph.updateNodeData('B', { status });
    });
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



## 内置扩展 [#内置扩展]

将 `node.type` 设为 `breathing-node`，节点在激活、选中或高亮时会出现呼吸动画。示例中可切换选中和高亮，与右侧普通节点对比。



```ts
node: {
  type: 'breathing-node',
  style: {
    size: 36,
    fill: '#1677ff',
    stroke: '#fff',
    strokeWidth: 2,
    label: (node) => String(node.data?.label ?? node.id),
    labelPlacement: 'bottom',
    labelFontSize: 12,
  },
  stateStyles: {
    selected: { fill: '#1677ff', stroke: '#003eb3', strokeWidth: 3, haloWidth: 16 },
    highlight: { fill: '#2E8B57', stroke: '#1F6B43', strokeWidth: 3, haloWidth: 12 },
  },
},
```

**完整运行代码**

```ts
/**
 * Breathing node demo.
 * Demonstrates the built-in breathing-node extension on selected/highlight states.
 */

import { Graph } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'selected', x: 180, y: 180, data: { label: 'Selected' }, states: ['selected'] },
        { id: 'highlight', x: 360, y: 180, data: { label: 'Highlight' }, states: ['highlight'] },
        { id: 'normal', x: 540, y: 180, data: { label: 'Normal' } },
      ],
      edges: [
        { id: 'edge-selected-highlight', source: 'selected', target: 'highlight' },
        { id: 'edge-highlight-normal', source: 'highlight', target: 'normal' },
      ],
    },
    // #region breathing-options
    node: {
      type: 'breathing-node',
      style: {
        size: 36,
        fill: '#1677ff',
        stroke: '#fff',
        strokeWidth: 2,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'bottom',
        labelFontSize: 12,
      },
      stateStyles: {
        selected: { fill: '#1677ff', stroke: '#003eb3', strokeWidth: 3, haloWidth: 16 },
        highlight: { fill: '#2E8B57', stroke: '#1F6B43', strokeWidth: 3, haloWidth: 12 },
      },
    },
    // #endregion breathing-options
    edge: {
      style: {
        stroke: '#d1d5db',
        lineWidth: 2,
        endArrow: true,
      },
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'click-select'],
  });

  const ui = createDemoPanel(container, '切换选中和高亮，观察节点呼吸动画。');
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy();
    destroy();
  };

  const toggleState = (state: 'selected' | 'highlight') => {
    const active = graph.getItemStates(state).includes(state);
    graph.setItemState(state, state, !active);
  };
  try {
    await graph.render();
    ui.addAction('切换选中', () => toggleState('selected'));
    ui.addAction('切换高亮', () => toggleState('highlight'));
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



## 常见问题 [#常见问题]

### 注册后为什么没有变化？ [#注册后为什么没有变化]

检查名称与 node.type、注册顺序，以及配置是否覆盖了需要观察的字段。描述按名称缓存，不持有单个 Graph 的可变状态。

### 为什么徽章移动了，边端点没动？ [#为什么徽章移动了边端点没动]

锚点钩子仅供装饰定位。任意自定义形状和拾取轮廓不在当前能力范围。

### 为什么动画持续重绘？ [#为什么动画持续重绘]

检查 drawOverlay 是否始终返回 true。静态内容返回 void / false，大图不要为所有节点持续绘制。

更多场景见[自定义节点与显式边 ID](/docs/examples/custom-node-extension)，注册作用域查[公共契约](/docs/api/graph#extension-registration)。

**相关可运行示例**

* [呼吸节点](/docs/examples/breathing-node)
* [自定义节点与显式边 ID](/docs/examples/custom-node-extension)
