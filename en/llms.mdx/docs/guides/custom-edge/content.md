# Custom edges (/en/docs/guides/custom-edge)





Use an `EdgeExtension` to reuse an edge type for a class of relationships. The `base` selects the path, arrows show direction, and `edge.style.label` supplies text. To vary width or color by data in one graph, use [style functions](/en/docs/guides/edge#options-edge-style-callbacks).

## Register and activate [#register-and-activate]

Choose `arc` as the base path, use `getStyle()` to set color and width by weight, and register the type with `register('edge', ...)`.



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

**Complete runnable code**

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



Set `edge.type` to the registered name in `new Graph()`. In this example, `light` starts with weight `1` and `heavy` with weight `4`.



```ts
edge: { type: 'docs-weighted-edge', style: { label: (_s, _t, edge) => edge.id ?? '' } },
```

**Complete runnable code**

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



## Overrides and updates [#overrides-and-updates]

Click **Toggle heavy weight** above. `updateEdgeData()` changes the weight and `getStyle()` updates the color and width. Click an edge to apply the purple selection style, or click empty space to restore its base style.



```ts
ui.addAction('Toggle heavy weight', () => {
  const weight = graph.getEdgeData('heavy')?.data?.weight === 4 ? 1 : 4;
  graph.updateEdgeData('heavy', { weight });
});
```

**Complete runnable code**

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



See [EdgeExtension](/en/docs/api/extensions#edgeextension) for style precedence and extension fields.

## Common questions [#common-questions]

### Can I implement arbitrary drawing or shaders? [#can-i-implement-arbitrary-drawing-or-shaders]

EdgeExtension provides base, style, getStyle, and stateStyles, without arbitrary draw / shader hooks. See [EdgeExtension](/en/docs/api/extensions#edgeextension).

### Why is a label missing? [#why-is-a-label-missing]

Descriptor defaults do not replace label activation. This example explicitly provides edge.style.label; data or descriptor text alone does not guarantee label traversal.

### Why is an edge difficult to select? [#why-is-an-edge-difficult-to-select]

Set hitAreaWidth and enable interaction. The example uses 14 without increasing visual width; see [picking width](/en/docs/guides/edge#picking-width).

See [registration](/en/docs/api/graph#extension-registration) for caching and errors.
