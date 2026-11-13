# Viewport and coordinates (/en/docs/guides/viewport)





The viewport is the part of the graph you can currently see. Panning or zooming changes how you view it; connections and node graph coordinates stay unchanged.

## Graph positions and the current view [#graph-positions-and-the-current-view]

A node's x / y is its graph position, supplied by data or computed by layout. Camera x / y / zoom describes translation and scale. Dragging a node changes its position; dragging the canvas changes the camera.

Relayout and fitting are separate steps: layout computes positions, while fitView adjusts the camera to bring content into view.

## Choose when to fit [#choose-when-to-fit]

| Task                                           | Approach                                                      |
| ---------------------------------------------- | ------------------------------------------------------------- |
| Show all content                               | fitView, with padding and zoom limits as needed               |
| Center without changing scale                  | fitCenter                                                     |
| Locate a node from a list                      | focusItem(id), shrinking when necessary to contain the target |
| Refresh data while keeping the view            | `setData(next, { fitView: false })`                           |
| Keep all content visible after a panel narrows | Configure autoFit at initialization                           |

The first await graph.render() performs an initial fit even with autoFit: false. Data replacement, relayout, and container resizing have separate policies. Do not call render again just to refresh the viewport.

Use the buttons below to compare centering and fitting. Zoom or pan first, then choose Center or Fit. Center retains zoom. Fit adjusts both translation and scale. Reset camera restores the first rendered camera.



```ts
const zoom = () => graph.zoomBy(1.5, { maxZoom: 4 });
const pan = () => {
  const camera = graph.getCamera();
  graph.setCamera({ x: camera.x + 80 });
};
const center = () => graph.fitCenter();
const fit = () => graph.fitView({ padding: [70, 50, 110, 50], maxZoom: 1 });
const reset = () => graph.resetCamera();
```

**Complete runnable code**

```ts
import { Graph, type Camera } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 240, y: 80 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: { style: { size: 32, label: (node) => node.id === 'A' ? 'A (0, 0)' : 'B (240, 80)', labelOffsetY: 10 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: [70, 50, 110, 50], maxZoom: 1 },
  });
  // #region camera
  const zoom = () => graph.zoomBy(1.5, { maxZoom: 4 });
  const pan = () => {
    const camera = graph.getCamera();
    graph.setCamera({ x: camera.x + 80 });
  };
  const center = () => graph.fitCenter();
  const fit = () => graph.fitView({ padding: [70, 50, 110, 50], maxZoom: 1 });
  const reset = () => graph.resetCamera();
  // #endregion camera
  let saved: Camera;
  // #region saved-view
  const save = () => { saved = graph.getCamera(); };
  const restore = () => graph.setCamera(saved);
  const focus = () => graph.focusItem('B', 32);
  // #endregion saved-view
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.5 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  const point = ({ x, y }: { x: number; y: number }) => `${Math.round(x * 10) / 10}, ${Math.round(y * 10) / 10}`;
  let frame = 0;
  let disposed = false;
  const update = () => {
    const camera = graph.getCamera();
    // #region coordinates
    const rect = container.getBoundingClientRect();
    const client = graph.graphToScreen(0, 0);
    const canvas = { x: client.x - rect.left, y: client.y - rect.top };
    const back = graph.screenToGraph(client.x, client.y);
    // #endregion coordinates
    status.textContent = [
      `A graph (0, 0) | camera (${point(camera)}) | zoom ${camera.zoom.toFixed(2)}`,
      `A canvas (${point(canvas)}) | A client (${point(client)})`,
      `screenToGraph(A client) = (${point(back)})`,
    ].join('\n');
  };
  const schedule = () => {
    if (disposed || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; if (!disposed) update(); });
  };
  const actions: Array<[string, () => void]> = [
    ['Zoom ×1.5', zoom], ['Pan right', pan], ['Center', center], ['Fit', fit], ['Reset camera', reset],
    ['Save view', save], ['Restore view', restore], ['Focus B', focus],
  ];
  const events = ['node:pointermove', 'edge:pointermove', 'canvas:pointermove', 'canvas:pointerup', 'resize'] as const;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    cancelAnimationFrame(frame);
    for (const event of events) graph.off(event, schedule);
    window.removeEventListener('click', schedule);
    window.removeEventListener('wheel', schedule);
    window.removeEventListener('scroll', schedule, true);
    ui.destroy();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    save();
    for (const event of events) graph.on(event, schedule);
    // Refresh after interaction and page scrolling, including the shared toolbar.
    window.addEventListener('click', schedule);
    window.addEventListener('wheel', schedule, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    for (const [label, action] of actions) {
      ui.addAction(label, () => { action(); schedule(); });
    }
    container.append(status);
    update();
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



[fitView parameters](/en/docs/api/graph#graph-viewport-fitview) · [fitCenter parameters](/en/docs/api/graph#fitcenter)

### Why is the graph still small after fitting? [#why-is-the-graph-still-small-after-fitting]

Check for distant nodes, far-reaching edges or Combos, then inspect padding and maxZoom. The example caps maxZoom at 1 to avoid over-enlarging a small graph. fitCenter only centers; use zoomTo or zoomBy to zoom in explicitly.

## Refresh data with or without fitting [#refresh-data-with-or-without-fitting]

Zoom with the toolbar or drag empty canvas, then choose Reload + keep view. B moves from x=240 to x=800 while the camera stays unchanged; B may leave the viewport. Use Reset example, then Reload + fit to compare: the updated content fits into view.



```ts
await graph.setData(data(next), {
  fitView: keepView ? false : fit,
});
```

**Complete runnable code**

```ts
import { Graph, type FitViewOptions, type GraphData } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const fit: FitViewOptions = { padding: [76, 48, 100, 48], maxZoom: 1 };
  const data = (wide: boolean): GraphData => ({
    nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: wide ? 800 : 240, y: 0 }],
    edges: [{ id: 'A-B', source: 'A', target: 'B' }],
  });
  const graph = new Graph({
    container, data: data(false), autoFit: false,
    node: { style: { size: 32, label: (node) => node.id, labelOffsetY: 10 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  let wide = false;
  let disposed = false;
  let frame = 0;
  let lastAction = 'Initial view';
  const reload = async (keepView: boolean) => {
    const before = graph.getCamera();
    const next = !wide;
    // #region preserve-view
    await graph.setData(data(next), {
      fitView: keepView ? false : fit,
    });
    // #endregion preserve-view
    if (graph.destroyed) return;
    wide = next;
    const after = graph.getCamera();
    const unchanged = before.x === after.x && before.y === after.y && before.zoom === after.zoom;
    lastAction = `Last reload (${keepView ? 'keep view' : 'refit'}): camera ${unchanged ? 'unchanged' : 'changed'}`;
  };
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.5 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  const update = () => {
    const camera = graph.getCamera();
    status.textContent = `A (0, 0), B (${wide ? 800 : 240}, 0) | ${lastAction}\ncamera (${camera.x.toFixed(1)}, ${camera.y.toFixed(1)}) | zoom ${camera.zoom.toFixed(2)}`;
  };
  const schedule = () => {
    if (disposed || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; if (!disposed) update(); });
  };
  const actions: Array<[string, () => void | Promise<void>]> = [
    ['Reload + keep view', () => reload(true)],
    ['Reload + fit', () => reload(false)],
    ['Focus A', () => { graph.focusItem('A'); lastAction = 'Focused A'; }],
  ];
  const events = ['node:pointermove', 'edge:pointermove', 'canvas:pointermove', 'canvas:pointerup', 'resize'] as const;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    cancelAnimationFrame(frame);
    for (const event of events) graph.off(event, schedule);
    window.removeEventListener('click', schedule);
    window.removeEventListener('wheel', schedule);
    ui.destroy(); status.remove();
    destroy();
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    graph.fitView(fit);
    for (const event of events) graph.on(event, schedule);
    window.addEventListener('click', schedule);
    window.addEventListener('wheel', schedule, { passive: true });
    const buttons = actions.map(([label, action]) => ui.addAction(label, async () => {
        for (const item of buttons) item.disable();
        try {
          await action();
          if (!disposed) update();
        } catch {
          if (!disposed) { lastAction = 'Update failed'; update(); }
        } finally {
          if (!disposed) for (const item of buttons) item.enable();
        }
    }));
    container.append(status);
    update();
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



Use fitView: false to keep the view; no camera save-and-restore is needed. New coordinates, layouts, and states still apply. Keeping the camera does not guarantee that a node stays at the same screen position. See [preserving selection](/en/docs/guides/states#preserve-selection-when-replacing-data) separately.

Omitting the second setData argument uses fitView(0.9); it does not inherit the initial autoFit padding. Pass a fit options object to this setData call, as in the example, to reuse your padding.

**Asynchronous refresh and saved views**

The example disables buttons during an update. For concurrent application requests, use a request sequence or cancellation to apply only the latest result. Check graph.destroyed after asynchronous work.

To restore a view across pages, save the getCamera() snapshot and call setCamera(saved) after the new instance's await render(). The camera records translation and zoom only; a different container size or different graph positions may show a different area. Calling fitView immediately afterward overwrites the restored camera.

## Handle resizing and completed layouts [#handle-resizing-and-completed-layouts]

Configure autoFit at initialization to keep all content visible after panel resizing. Keep false (the default) to retain the user's zoom and pan during exploration. Graph uses ResizeObserver to synchronize container dimensions; neither policy requires recreating the instance.

Zoom first, then switch Width 65% / 100% below. Only container CSS width changes. Inspect the final zoom and camera after resize; the complete source includes the listener and cleanup.



```ts
autoFit: { padding: [84, 40, 100, 40], maxZoom: 1 },
```

**Complete runnable code**

```ts
import { Graph } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const originalWidth = container.style.width;
  const originalOutline = container.style.outline;
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 800, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: { style: { size: 32, label: (node) => node.id, labelOffsetY: 10 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    // #region auto-fit
    autoFit: { padding: [84, 40, 100, 40], maxZoom: 1 },
    // #endregion auto-fit
  });
  // ResizeObserver detects these CSS width changes; no setSize or render call.
  const narrow = () => { container.style.width = '65%'; };
  const wide = () => { container.style.width = '100%'; };
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.5 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  let resizeCount = 0;
  let frame = 0;
  let disposed = false;
  const update = () => {
    const camera = graph.getCamera();
    status.textContent = `container ${Math.round(container.getBoundingClientRect().width)} CSS px | resize events: ${resizeCount}\nzoom ${graph.getZoom().toFixed(2)} | camera (${camera.x.toFixed(1)}, ${camera.y.toFixed(1)})`;
  };
  const schedule = () => {
    if (disposed || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; if (!disposed) update(); });
  };
  const resized = () => { resizeCount++; update(); };
  const actions: Array<[string, () => void]> = [
    ['Width 65%', narrow], ['Width 100%', wide],
    ['Zoom ×1.5', () => graph.zoomBy(1.5)],
  ];
  const events = ['node:pointermove', 'edge:pointermove', 'canvas:pointermove', 'canvas:pointerup'] as const;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    cancelAnimationFrame(frame);
    graph.off('resize', resized);
    for (const event of events) graph.off(event, schedule);
    window.removeEventListener('click', schedule);
    window.removeEventListener('wheel', schedule);
    ui.destroy(); status.remove();
    destroy();
    container.style.width = originalWidth;
    container.style.outline = originalOutline;
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    graph.on('resize', resized);
    for (const event of events) graph.on(event, schedule);
    window.addEventListener('click', schedule);
    window.addEventListener('wheel', schedule, { passive: true });
    container.style.outline = '1px dashed #cbd5e1';
    for (const [label, action] of actions) {
      ui.addAction(label, () => { action(); schedule(); });
    }
    container.append(status);
    update();
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



The container needs nonzero width and height. To reset the view when revealing a hidden tab, explicitly fitView after the container reaches its final size. The resize event follows any automatic fitting.

After await graph.layout(), either call `graph.fitView({ padding: 32, maxZoom: 1 })` or retain the current camera. Layout computes node positions; fitting is explicit. See [layout methods](/en/docs/api/graph#graph-layout) for asynchronous cancellation.

## Convert coordinates to position DOM content [#convert-coordinates-to-position-dom-content]

Use screenToGraph and graphToScreen to convert between graph and client coordinates. Watch A in the canvas above to compare the three coordinate spaces. Zooming or panning changes the canvas position. Scrolling the page changes the client position.

| Coordinates | Origin                                | Common use                                               |
| ----------- | ------------------------------------- | -------------------------------------------------------- |
| graph       | The graph's own coordinate system     | Store node positions, run layouts, create graph elements |
| canvas      | Canvas top-left, CSS pixels           | Position auxiliary content inside the canvas container   |
| client      | Browser viewport top-left, CSS pixels | Match mouse clientX / clientY, place fixed menus         |

Convert DOM mouse events using clientX / clientY. Element events already supply event.graph, event.canvas, and event.client. Fixed menus use client coordinates. Absolutely positioned content inside a canvas container without borders or padding uses CSS coordinates relative to that container.

```ts
import type { Graph } from '@antv/g6-lite';

export function pointAtMouse(graph: Graph, event: MouseEvent) {
  return graph.screenToGraph(event.clientX, event.clientY);
}

// marker is mounted on document.body; point is in graph coordinates
export function placeMarker(graph: Graph, marker: HTMLElement, point: { x: number; y: number }) {
  const client = graph.graphToScreen(point.x, point.y);
  Object.assign(marker.style, {
    position: 'fixed', left: `${client.x}px`, top: `${client.y}px`,
  });
}
```

Reproject the anchor after zooming, panning, or page scrolling; close menus that should not follow. Do not multiply by DPR. screenToGraph does not take offsetX / offsetY or screenX / screenY.

## Common questions [#common-questions]

### Should I save new node positions after panning or zooming? [#should-i-save-new-node-positions-after-panning-or-zooming]

These operations did not move nodes. Read getCamera to save the user's view, or element positions to save the layout; handle them separately.

### Why does a menu drift as I zoom? [#why-does-a-menu-drift-as-i-zoom]

Check for graph coordinates used directly as CSS positions, or canvas positions treated as client. Choose coordinates according to where the menu is mounted.

### Why does centered content still not fit? [#why-does-centered-content-still-not-fit]

fitCenter changes position only. Use fitView to adjust zoom too, and check padding and zoom bounds.

### Why does refreshing move the view with autoFit disabled? [#why-does-refreshing-move-the-view-with-autofit-disabled]

Check that setData receives fitView: false and that application code does not call fitView afterward. Disabling autoFit prevents automatic fitting on container resize; data replacement has its own fitting policy.

### Why do method and wheel zoom limits differ? [#why-do-method-and-wheel-zoom-limits-differ]

minZoom and maxZoom on zoomTo / zoomBy constrain that call only. Wheel limits belong to the zoom-canvas Behavior, and fitView limits are separate again. Set each when consistent limits are required. See [wheel zoom options](/en/docs/api/options#navigation-and-dragging).

Continue with [viewport methods](/en/docs/api/graph#graph-viewport), [autoFit](/en/docs/api/options#autofit), [setData](/en/docs/api/graph#setdata), and [element event coordinates](/en/docs/api/graph/events#read-event-parameters).

**Related runnable examples**

* [Search and focus](/en/docs/examples/search-focus)
* [Viewport and coordinate conversion](/en/docs/examples/viewport-controls)
* [Zoom range and sensitivity](/en/docs/examples/zoom-options)
