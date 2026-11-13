# Event basics (/en/docs/guides/events)





Graph events tell you what was clicked or selected and which data operation completed. Start with the click example, then follow the links below for other event use cases.

## Element events [#element-events]

### Listen to a node click [#listen-to-a-node-click]

On an existing Graph, register a handler; click-select is not required.

```ts
import type { Graph } from '@antv/g6-lite';

declare const graph: Graph;
graph.on('node:click', ({ nodeId }) => {
  console.log('Clicked node', nodeId);
});
```

Listening does not select nodes or change styles. Click a node, edge, or empty space below to see its target and coordinates.



```ts
const onClick = (event: GraphElementEvent) => {
  latest = [
    `${event.targetType}: ${event.targetId ?? 'empty'}`,
    `client (${point(event.client)})`,
    `canvas (${point(event.canvas)})`,
    `graph (${point(event.graph)})`,
  ].join(' | ');
  update();
};
const clickEvents = ['node:click', 'edge:click', 'canvas:click'] as const;
for (const event of clickEvents) graph.on(event, onClick);
```

**Complete runnable code**

```ts
import { Graph, type GraphElementEvent, type GraphEventMap } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 160, y: 0 }, { id: 'C', x: 320, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: { style: { size: 32, label: (node) => node.id, labelOffsetY: 8 } },
    edge: { style: { hitAreaWidth: 12 } },
    behaviors: [],
    autoFit: { padding: 60, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;bottom:12px;left:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.6 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  let latest = 'Click a node, edge, or empty canvas';
  let onceResult = 'once: not armed';
  const update = () => { status.textContent = `${latest}\n${onceResult}`; };
  const point = ({ x, y }: { x: number; y: number }) => `${Math.round(x)}, ${Math.round(y)}`;
  // #region listeners
  const onClick = (event: GraphElementEvent) => {
    latest = [
      `${event.targetType}: ${event.targetId ?? 'empty'}`,
      `client (${point(event.client)})`,
      `canvas (${point(event.canvas)})`,
      `graph (${point(event.graph)})`,
    ].join(' | ');
    update();
  };
  const clickEvents = ['node:click', 'edge:click', 'canvas:click'] as const;
  for (const event of clickEvents) graph.on(event, onClick);
  // #endregion listeners
  const onOnce = ({ nodeId }: GraphEventMap['node:click'][0]) => {
    onceResult = `once: ${nodeId} (consumed)`;
    update();
  };
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    for (const event of clickEvents) graph.off(event, onClick);
    graph.off('node:click', onOnce);
    ui.destroy();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    update();
    ui.gui.add({ listening: true }, 'listening').name('Listening').onChange((listening: boolean) => {
      for (const event of clickEvents) {
        if (listening) graph.on(event, onClick);
        else graph.off(event, onClick);
      }
    });
    ui.addAction('Arm once', () => {
      graph.off('node:click', onOnce);
      graph.once('node:click', onOnce);
      onceResult = 'once: waiting for a node click';
      update();
    });
    container.append(status);
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



### Read data and positions [#read-data-and-positions]

* data is optional business data attached to the node or edge.
* client is the viewport position, useful for menus.
* canvas is CSS pixels from the canvas top-left.
* graph is the graph position, useful for creating or moving elements.

For edges, read edgeId / source / target; for group backgrounds, read comboId. Find all fields and mouse events in [element events](/en/docs/api/graph/events#event-element).

### Listen for Combo hover [#listen-for-combo-hover]

Use `combo:pointerover` to show a group hint and `combo:pointerleave` to hide it. Moving from the group background onto one of its nodes also triggers the leave event. See [Combo events](/en/docs/api/graph/events#combos).

## Removing listeners [#removing-listeners]

Retain the registered function and remove it on unmount or subscription replacement. A new arrow function with similar text is a different reference.

```ts
import type { Graph } from '@antv/g6-lite';

export function observeClicks(graph: Graph, onClick: () => void) {
  graph.on('node:click', onClick);
  return () => graph.off('node:click', onClick);
}
```

Use once when you need only the next occurrence. Arm once registers the next node click; Listening controls the independent persistent subscription. See [on / off / once](/en/docs/api/graph#on) for parameters.

## Selection and drag events [#selection-and-drag-events]

To synchronize selected nodes, observe selection results. To persist moved positions, observe drag completion. Enable the corresponding Behavior first.

Continue with [selection and dragging](/en/docs/guides/events/selection-drag): try the canvas, then connect selection, persistence, and cleanup.

## Lifecycle and data events [#lifecycle-and-data-events]

Initial rendering, incremental changes, replacement, and relayout emit different events. afterrender does not repeat for every data update.

See when to update the graph, read node positions, or respond to data replacement. [Rendering, layout, and data updates](/en/docs/guides/events/lifecycle)

## Common questions [#common-questions]

### Why is nativeEvent undefined? [#why-is-nativeevent-undefined]

Element clicks, hover, and wheel expose nativeEvent. Selection and some drag stages use event; drag completion and region selection may have no native-event field. Look up the event in the [event reference](/en/docs/api/graph/events).

### Why are positions still old when layout finishes? [#why-are-positions-still-old-when-layout-finishes]

layout:end / afterlayout precede write-back. Await graph.layout() before querying; see the [lifecycle guide](/en/docs/guides/events/lifecycle).

### Why does a listener fire repeatedly or never fire? [#why-does-a-listener-fire-repeatedly-or-never-fire]

Check duplicate registration, handler identity for off, whether once was consumed, and whether the required Behavior is enabled.

## Custom events [#custom-event-typing]

Use `graph.emit()` to dispatch application events, such as a reset-view notification from a toolbar button. [See the custom event example](/en/docs/guides/events/custom)

Continue with the [event reference](/en/docs/api/graph/events), [interaction combinations](/en/docs/guides/behaviors), and [event panel](/en/docs/examples/event-log).

**Related runnable examples**

* [Event log](/en/docs/examples/event-log)
* [Context menu](/en/docs/examples/context-menu)
