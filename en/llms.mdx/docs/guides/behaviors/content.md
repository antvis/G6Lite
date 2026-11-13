# Common behavior options (/en/docs/guides/behaviors)





List behaviors in `new Graph()` through `behaviors`. See the [Interaction overview](/en/docs/guides/behavior-overview) for the available behaviors.

## BehaviorOption [#built-in-behaviors]

Use a behavior name, such as `'drag-canvas'`, to use its defaults. To customize it, pass an object with its name in `type` and its options alongside it.

See the [11 built-in behavior previews](/en/docs/api/options#built-in-index).

## Configure pan, brush, and lasso [#common-combinations]

Drag empty space to pan, Shift-drag to select a rectangle, or Ctrl/Meta-drag to select a freehand area.

```ts
import type { BehaviorName, BuiltInBehaviorConfig } from '@antv/g6-lite';

const behaviors = [
  'zoom-canvas',
  { type: 'drag-canvas', ignoreModifierKeys: true },
  'drag-node',
  { type: 'click-select', multiple: true, trigger: 'shift' },
  { type: 'brush-select', key: 'shift' },
  { type: 'lasso-select', key: 'ctrl' },
] satisfies Array<BehaviorName | BuiltInBehaviorConfig>;
```

Try the three gestures in the [selection example](/en/docs/examples/selection-behaviors). Click selection distinguishes `ctrl` and `meta`, while area selection accepts either when set to `ctrl`. See the [selection reference](/en/docs/api/options#selection) for details.

## Switch behaviors at runtime [#switch-behaviors]

Choose Browse to pan by dragging empty space. In Select mode, drag empty space to brush or click a node to select it. The selection and view stay in place when you switch back to Browse or choose Off.



```ts
if (mode === 'select') {
  graph.updateOptions({ behaviors: ['zoom-canvas', 'click-select', 'brush-select'] });
} else if (mode === 'browse') {
  graph.setBehaviors(['zoom-canvas', 'drag-canvas']);
} else {
  graph.setBehaviors([]);
}
```

**Complete runnable code**

```ts
import { Graph } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 150, y: -65 },
        { id: 'C', x: 150, y: 65 },
      ],
      edges: [{ source: 'A', target: 'B' }, { source: 'A', target: 'C' }],
    },
    node: {
      style: { size: 28, label: (node) => node.id, labelOffsetY: 8 },
      stateStyles: { selected: { fill: '#8050d2', haloWidth: 10 } },
    },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 55, maxZoom: 1 },
  });

  const ui = createDemoPanel(container);
  const switchMode = (mode: string) => {
    // #region switch
    if (mode === 'select') {
      graph.updateOptions({ behaviors: ['zoom-canvas', 'click-select', 'brush-select'] });
    } else if (mode === 'browse') {
      graph.setBehaviors(['zoom-canvas', 'drag-canvas']);
    } else {
      graph.setBehaviors([]);
    }
    // #endregion switch
  };
  const showSelection = () => {
    ui.setStatus(`Selected: ${graph.findNodesByState('selected').join(', ') || 'none'}`);
  };
  graph.on('node:selectchange', showSelection);
  graph.on('selection:clear', showSelection);
  graph.on('brush:end', showSelection);

  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy();
    destroy();
  };
  try {
    await graph.render();
    showSelection();
    ui.addChoice('Mode', { Browse: 'browse', Select: 'select', Off: 'off' }, 'browse', switchMode);
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



Pass the complete list. `setBehaviors([])` disables all behaviors, and `setBehaviors()` restores default zoom and pan. See [`setBehaviors()`](/en/docs/api/graph#setbehaviors) for the full rules.

## Zoom feel and bounds [#zoom-feel-and-bounds]

Set sensitivity, minZoom, and maxZoom on zoom-canvas; sensitivity: 0.5 softens wheel response. Zoom centers on the canvas. Wheel bounds do not restrict programmatic fitView. See [navigation options](/en/docs/api/options#navigation-and-dragging) for defaults, normalization, and fallback.

## Neighborhood highlighting [#neighborhood-highlighting]

Hover B to highlight A/B/C/E and connecting edges while dimming other nodes. An edge emphasizes itself and its endpoints. Leaving clears hover states. State styles define green; the Behavior decides when to apply the states.



```ts
behaviors: ['zoom-canvas', 'drag-canvas', { type: 'hover-highlight', degree: 1, inactiveState: 'inactive' }],
```

**Complete runnable code**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 0, y: 0 }, { id: 'B', x: 120, y: 0 },
        { id: 'C', x: 240, y: 0 }, { id: 'D', x: 360, y: 0 },
        { id: 'E', x: 120, y: 100 }, { id: 'Isolated', x: 360, y: 100 },
      ],
      edges: [
        { source: 'A', target: 'B' }, { source: 'B', target: 'C' },
        { source: 'C', target: 'D' }, { source: 'B', target: 'E' },
      ],
    },
    node: {
      style: { size: 30, label: (node) => node.id, labelOffsetY: 8 },
      stateStyles: { highlight: { fill: '#00A876', stroke: '#005C41', strokeWidth: 2 } },
    },
    edge: { style: { hitAreaWidth: 12 }, stateStyles: { highlight: { stroke: '#00A876', lineWidth: 2 } } },
    // #region highlight
    behaviors: ['zoom-canvas', 'drag-canvas', { type: 'hover-highlight', degree: 1, inactiveState: 'inactive' }],
    // #endregion highlight
    autoFit: { padding: 60, maxZoom: 1 },
  });
  const status = document.createElement('div');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;z-index:20;background:white;color:#334155;padding:6px 10px;border-radius:6px;font:12px system-ui;';
  status.setAttribute('role', 'status');
  const updateStatus = () => {
    status.textContent = `highlight: ${graph.findNodesByState('highlight').join(', ') || 'none'}`;
  };
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { status.remove(); destroy(); };
  try {
    await graph.render();
    graph.on('node:pointerover', updateStatus);
    graph.on('node:pointerleave', updateStatus);
    graph.on('edge:pointerover', updateStatus);
    graph.on('edge:pointerleave', updateStatus);
    updateStatus();
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



## Tooltip [#tooltip]

Enable `tooltip` in `behaviors` to show node and edge details. Use hover for previews or click for details that stay open.

### Custom content [#custom-content]

Hover API, DB, or an edge for 120ms to show a card; leave to hide it. enable excludes the Cache node. The code returns an HTMLElement populated with textContent, so angle brackets in the API name remain literal text.



```ts
const tooltip: BuiltInBehaviorOptionsMap['tooltip'] = {
  type: 'tooltip', trigger: 'hover', delay: 120, className: 'docs-hover-tooltip',
  enable: (ctx) => ctx.nodeId !== 'Cache',
  getContent: (ctx) => {
    const card = document.createElement('div');
    card.style.cssText = 'padding:10px 14px;border-radius:8px;background:#163B65;color:white;font:12px system-ui;box-shadow:0 4px 16px #163b6533;';
    const title = document.createElement('strong');
    title.textContent = String(ctx.data?.label ?? ctx.nodeId ?? ctx.edgeId ?? '');
    const detail = document.createElement('div');
    detail.textContent = ctx.itemType === 'node'
      ? `Requests: ${Number(ctx.data?.requests ?? 0)}`
      : `${ctx.source} → ${ctx.target}`;
    card.append(title, detail);
    return card;
  },
};
```

**Complete runnable code**

```ts
import { Graph, type BuiltInBehaviorOptionsMap } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region tooltip
  const tooltip: BuiltInBehaviorOptionsMap['tooltip'] = {
    type: 'tooltip', trigger: 'hover', delay: 120, className: 'docs-hover-tooltip',
    enable: (ctx) => ctx.nodeId !== 'Cache',
    getContent: (ctx) => {
      const card = document.createElement('div');
      card.style.cssText = 'padding:10px 14px;border-radius:8px;background:#163B65;color:white;font:12px system-ui;box-shadow:0 4px 16px #163b6533;';
      const title = document.createElement('strong');
      title.textContent = String(ctx.data?.label ?? ctx.nodeId ?? ctx.edgeId ?? '');
      const detail = document.createElement('div');
      detail.textContent = ctx.itemType === 'node'
        ? `Requests: ${Number(ctx.data?.requests ?? 0)}`
        : `${ctx.source} → ${ctx.target}`;
      card.append(title, detail);
      return card;
    },
  };
  // #endregion tooltip
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'API', x: 0, y: 0, data: { label: '<API Gateway>', requests: 1280 } },
        { id: 'DB', x: 180, y: 0, data: { label: 'Database', requests: 960 } },
        { id: 'Cache', x: 360, y: 0 },
      ],
      edges: [
        { id: 'request', source: 'API', target: 'DB', data: { label: 'Request' } },
        { id: 'warm', source: 'DB', target: 'Cache', data: { label: 'Warm cache' } },
      ],
    },
    node: { style: { size: 32, label: (node) => node.id, labelOffsetY: 8 } },
    edge: { style: { hitAreaWidth: 12 } },
    behaviors: [tooltip],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



### Click to show [#click-to-show]

Click API, DB, or an edge to show details. Repeating the same element or clicking empty canvas closes the card. Click mode does not use the hover delay; the displayed code runs this exact configuration.



```ts
const tooltip: BuiltInBehaviorOptionsMap['tooltip'] = {
  type: 'tooltip', trigger: 'click', className: 'docs-click-tooltip',
  enable: (ctx) => ctx.nodeId !== 'Cache',
  getContent: (ctx) => {
    const card = document.createElement('div');
    card.style.cssText = 'padding:10px 14px;border-radius:8px;background:#163B65;color:white;font:12px system-ui;box-shadow:0 4px 16px #163b6533;';
    const title = document.createElement('strong');
    title.textContent = String(ctx.data?.label ?? ctx.nodeId ?? ctx.edgeId ?? '');
    const detail = document.createElement('div');
    detail.textContent = ctx.itemType === 'node'
      ? `Requests: ${Number(ctx.data?.requests ?? 0)}`
      : `${ctx.source} → ${ctx.target}`;
    card.append(title, detail);
    return card;
  },
};
```

**Complete runnable code**

```ts
import { Graph, type BuiltInBehaviorOptionsMap } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region tooltip
  const tooltip: BuiltInBehaviorOptionsMap['tooltip'] = {
    type: 'tooltip', trigger: 'click', className: 'docs-click-tooltip',
    enable: (ctx) => ctx.nodeId !== 'Cache',
    getContent: (ctx) => {
      const card = document.createElement('div');
      card.style.cssText = 'padding:10px 14px;border-radius:8px;background:#163B65;color:white;font:12px system-ui;box-shadow:0 4px 16px #163b6533;';
      const title = document.createElement('strong');
      title.textContent = String(ctx.data?.label ?? ctx.nodeId ?? ctx.edgeId ?? '');
      const detail = document.createElement('div');
      detail.textContent = ctx.itemType === 'node'
        ? `Requests: ${Number(ctx.data?.requests ?? 0)}`
        : `${ctx.source} → ${ctx.target}`;
      card.append(title, detail);
      return card;
    },
  };
  // #endregion tooltip
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'API', x: 0, y: 0, data: { label: '<API Gateway>', requests: 1280 } },
        { id: 'DB', x: 180, y: 0, data: { label: 'Database', requests: 960 } },
        { id: 'Cache', x: 360, y: 0 },
      ],
      edges: [
        { id: 'request', source: 'API', target: 'DB', data: { label: 'Request' } },
        { id: 'warm', source: 'DB', target: 'Cache', data: { label: 'Warm cache' } },
      ],
    },
    node: { style: { size: 32, label: (node) => node.id, labelOffsetY: 8 } },
    edge: { style: { hitAreaWidth: 12 } },
    behaviors: [tooltip],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



### Options [#options]

Find defaults, callback signatures, container, and context fields in [TooltipOptions](/en/docs/api/options#tooltipoptions) and [TooltipContext](/en/docs/api/options#tooltipcontext). ctx.event is the original mouse event, unlike the nativeEvent property on ordinary Graph events.

Default content uses node data.label/id, or edge data.label/endpoint names. Custom getContent strings are written as HTML, so escape dynamic values. When HTML is unnecessary, prefer an element filled through textContent as above.

### Styling [#styling]

The library positions and shows/hides the surface without a visual skin. Both examples style the returned element directly. Alternatively, configure className and style the outer surface, such as its default class:

```css
.g6lite-tooltip {
  padding: 8px 12px;
  border-radius: 8px;
  background: #163b65;
  color: white;
  font-size: 12px;
}
```

By default the surface mounts in document.body, uses viewport positioning, and flips at edges. A custom container changes both mounting and collision boundaries; verify positioning ancestors, scrolling, and clipping, including how transforms affect fixed positioning.

### Tooltip questions [#tooltip-questions]

#### Why is the card unstyled or unclickable? [#why-is-the-card-unstyled-or-unclickable]

Provide application CSS; there is no built-in visual skin. The overlay has pointer-events: none. Use your own application overlay for buttons, forms, or interactive cards.

#### Why does a Combo show no Tooltip? [#why-does-a-combo-show-no-tooltip]

The built-in handles nodes/edges only. Use public events with an application overlay for Combo details rather than internal picking.

#### Does an open card update immediately after data changes? [#does-an-open-card-update-immediately-after-data-changes]

setData does not recreate Tooltip. Later pointer events read content again. Use setBehaviors to change Tooltip configuration. The old Tooltip releases its listeners, timers, and overlay.

## Event dispatch [#event-dispatch]

Listening to node:click does not require click-select; that Behavior adds selected-state toggling. Subscribe before render if needed, then unsubscribe with the same function:

```ts
const onNodeClick = ({ nodeId }: { nodeId: string }) => console.log(nodeId);
graph.on('node:click', onNodeClick);
// On component unmount:
graph.off('node:click', onNodeClick);
```

Selection integration should account for node:selectchange, edge:selectchange, brush:end, and lasso:end. Query state for the final set; not every selection source emits a per-node selectchange. See the [event guide](/en/docs/guides/events#selection-and-drag-events) for integration and cleanup, and the [event reference](/en/docs/api/graph/events#selection-events) for complete payloads.

**Connection editing and dispatch internals**

drag-edge proposes reconnection without changing source/target or drawing a temporary edge. Handle edge:dragend, validate reconnected, update application edge data, then apply it through public methods such as setData. A configured layout still runs during setData; fitView: false preserves only the camera.

Shared picking prioritizes node → edge → combo → canvas. Behaviors consume that event stream; do not access internal Picking, Renderer, or eventEmitter.

## Common questions [#common-questions]

### Why did adding tooltip disable zoom? [#why-did-adding-tooltip-disable-zoom]

The explicit list replaced defaults. Include zoom-canvas and drag-canvas too.

### Why does brushing also move the canvas? [#why-does-brushing-also-move-the-canvas]

Bind brushing to Shift and retain drag-canvas's ignoreModifierKeys: true. Give brush and lasso different gestures.

### Can updateOptions switch Behaviors? [#can-updateoptions-switch-behaviors]

Yes. Use `setBehaviors()` to switch interactions, or pass `behaviors` to `updateOptions()` when updating appearance at the same time.

## Related [#related]

* [Behavior reference](/en/docs/api/options#options-behaviors): options, defaults, and boundaries.
* [Custom interactions](/en/docs/guides/custom-behavior) · [Standalone Tooltip example](/en/docs/examples/tooltip).
* [Events](/en/docs/guides/events) · [Selection example](/en/docs/examples/selection-behaviors).
* [Neighbor highlighting](/en/docs/examples/neighbor-highlight): hover to inspect one-hop adjacency.

**Related runnable examples**

* [Hover highlight](/en/docs/examples/hover)
* [One-hop highlight](/en/docs/examples/neighbor-highlight)
* [Drag nodes and combos](/en/docs/examples/drag-node)
* [Drag edge endpoints](/en/docs/examples/drag-edge)
