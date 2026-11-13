# Custom nodes (/en/docs/guides/custom-node)





Use `NodeExtension` to package a reusable node appearance. You can also set colors and sizes directly in [node configuration](/en/docs/guides/node#options-node).

## Use cases [#use-cases]

1. Choose circle / rect to retain built-in rendering and picking.
2. Define default style and pure getStyle; register before first render.
3. Activate node.type and use public data methods for business updates.

## Overlays and boundary anchors [#overlays-and-boundary-anchors]

`drawOverlay()` draws the stripe on the left. `getBoundaryAnchor()` places the right badge a quarter of the node’s height above its center. Click **Toggle B status** to see the stripe and badge stay in place as B changes appearance.



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

**Complete runnable code**

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



## Built-in extension [#built-in-extension]

Set `node.type` to `breathing-node` to add a pulse to active, selected, or highlighted nodes. Toggle selection or highlighting in the example and compare with the normal node on the right.



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

**Complete runnable code**

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



## Common questions [#common-questions]

### Why did registration have no effect? [#why-did-registration-have-no-effect]

Check the name, node.type, registration order, and configured overrides. Descriptors are cached by name, not owned mutable state for each Graph.

### Why did the badge move without changing edge endpoints? [#why-did-the-badge-move-without-changing-edge-endpoints]

The anchor hook positions decorations. Arbitrary shapes and picking outlines are outside the current contract.

### Why does the animation redraw continuously? [#why-does-the-animation-redraw-continuously]

Check whether drawOverlay always returns true. Static content returns void / false; avoid continuous per-node drawing on large graphs.

See [custom nodes and explicit edge IDs](/en/docs/examples/custom-node-extension) and [registration](/en/docs/api/graph#extension-registration).

**Related runnable examples**

* [Breathing node](/en/docs/examples/breathing-node)
* [Custom nodes and explicit edge IDs](/en/docs/examples/custom-node-extension)
