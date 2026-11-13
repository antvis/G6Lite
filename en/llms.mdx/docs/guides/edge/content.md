# Common edge options (/en/docs/guides/edge)





Use `GraphOptions.edge` to choose a path and configure the line, arrows, and labels. See [Edge overview](/en/docs/elements/edge) for endpoints, direction, and edge data.

<span id="basic-configuration" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## EdgeConfig [#edgeconfig]

`EdgeConfig` is the `edge` option passed to `new Graph()`. This example draws a blue line with a target arrow and uses purple when the edge is selected.

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: '#container',
  data: {
    nodes: [{ id: 'a', x: 80, y: 100 }, { id: 'b', x: 260, y: 100 }],
    edges: [{ id: 'a-b', source: 'a', target: 'b' }],
  },
  edge: {
    type: 'line',
    style: { stroke: '#1783FF', lineWidth: 2, endArrow: true },
    stateStyles: { selected: { stroke: '#7C3AED', lineWidth: 4 } },
  },
  behaviors: ['click-select'],
});

await graph.render();
```

| Property                                  | Description                                       | Type                                                 | Default                         | Required |
| ----------------------------------------- | ------------------------------------------------- | ---------------------------------------------------- | ------------------------------- | -------- |
| [`type`](#types)                          | Built-in edge type or registered custom edge name | `string`                                             | `'line'`                        | No       |
| [`style`](#style-fields)                  | Line, path parameters, arrows, and labels         | `EdgeConfig['style']`                                | Theme and built-in styles       | No       |
| [`stateStyles`](#state-styles)            | Appearance overrides by state                     | `Partial<Record<EdgeState, EdgeStateStyleOverride>>` | Extension or theme state styles | No       |
| [`parallelEdges`](#parallel-edge-spacing) | Separate edges with the same endpoints            | `boolean \| ParallelEdgesConfig`                     | Disabled                        | No       |
| [`labelRenderer`](#edge-label-renderer)   | Registered label renderer                         | `string`                                             | Built-in label renderer         | No       |

## Specify the edge type [#types]

Set `edge.type` to specify the edge type. The default is `line`. This example uses `polyline` for all edges in the graph.

```ts
const graph = new Graph({
  container,
  data,
  edge: { type: 'polyline' },
});
```

| Type value | Name                        | Use                                                                    |
| ---------- | --------------------------- | ---------------------------------------------------------------------- |
| `line`     | [Straight line](#edge-line) | Connect endpoints directly                                             |
| `arc`      | [Arc](#edge-arc)            | Control the bend or separate edges with the same endpoints             |
| `cubic`    | [Cubic Bézier](#edge-cubic) | Connect horizontal levels with a smooth curve                          |
| `polyline` | [Polyline](#edge-polyline)  | Route connections in flowcharts, directory trees, or fishbone diagrams |

[Register a custom edge](/en/docs/guides/custom-edge) before using its name as `edge.type`.

### Line edges [#edge-line]

`line` connects the endpoints directly. Set `endArrow: true` to draw an arrow at the target.

```ts
const edge = { type: 'line', style: { lineWidth: 2, endArrow: true } };
```

### Arcs and cubic curves [#arcs-and-cubic-curves]

#### Arc edges [#edge-arc]

Use `curvature` to control which way and how far the arc bends. Compare `-0.35`, `0`, and `0.35` below.



```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const rows = [
    { id: 'curvature -0.35', y: 60, curvature: -0.35 },
    { id: 'curvature 0', y: 150, curvature: 0 },
    { id: 'curvature 0.35', y: 240, curvature: 0.35 },
  ];
  const graph = new Graph({
    container,
    data: {
      nodes: rows.flatMap((row) => [
        { id: row.id + '-s', x: 100, y: row.y, data: { label: row.id } },
        { id: row.id + '-t', x: 440, y: row.y },
      ]),
      edges: rows.map((row) => ({ id: row.id, source: row.id + '-s', target: row.id + '-t', data: row })),
    },
    node: { style: { size: 20, label: (node) => String(node.data?.label ?? '') } },
    edge: {
      type: 'arc',
      style: { curvature: (_s, _t, edge) => Number(edge.data?.curvature ?? 0), lineWidth: 2, hitAreaWidth: 12 },
      stateStyles: { selected: { stroke: '#873bf4' } },
    },
    behaviors: ['click-select'],
    autoFit: { padding: 48, maxZoom: 1 },
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



#### Cubic edges [#edge-cubic]

`curveOffset` sets the horizontal handles of a cubic edge. Compare `30` and `120` below. The path may remain straight when the endpoints share a height.



```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const rows = [{ id: 'offset 30', y: 40, offset: 30 }, { id: 'offset 120', y: 180, offset: 120 }];
  const graph = new Graph({
    container,
    data: {
      nodes: rows.flatMap((row) => [
        { id: row.id + '-s', x: 100, y: row.y, data: { label: row.id } },
        { id: row.id + '-t', x: 440, y: row.y + 80 },
      ]),
      edges: rows.map((row) => ({ id: row.id, source: row.id + '-s', target: row.id + '-t', data: row })),
    },
    node: { type: 'rect', style: { width: 70, height: 28, label: (node) => String(node.data?.label ?? '') } },
    edge: {
      type: 'cubic',
      style: { curveOffset: (_s, _t, edge) => Number(edge.data?.offset ?? 60), lineWidth: 2, hitAreaWidth: 12 },
      stateStyles: { selected: { stroke: '#873bf4' } },
    },
    behaviors: ['click-select'],
    autoFit: { padding: 48, maxZoom: 1 },
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



<span id="basic-styles" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="edge-style-fields" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## Style [#style-fields]

### Edge path styles [#edge-path-styles]

Line styles control an edge’s color, width, opacity, and direction.

| Field          | Type                       | Default or fallback                                     | Meaning                                                                                                               |
| -------------- | -------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `stroke`       | `EdgeStyleValue<string>`   | `theme.edgeStroke`; light `'#99ADD1'`, dark `'#637088'` | Edge and arrow color                                                                                                  |
| `lineWidth`    | `EdgeStyleValue<number>`   | `theme.edgeLineWidth`, preset `1`                       | Visual width; use a finite positive value                                                                             |
| `opacity`      | `EdgeStyleValue<number>`   | `1`                                                     | Opacity from `0` to `1`                                                                                               |
| `lineDash`     | `EdgeStyleValue<number[]>` | `[]`                                                    | Empty means solid; the current period uses the sum of the first two values, as described in [Dash rules](#dash-rules) |
| `startArrow`   | `EdgeStyleValue<boolean>`  | `false`                                                 | Source-end arrow pointing toward `source`                                                                             |
| `endArrow`     | `EdgeStyleValue<boolean>`  | `theme.edgeArrow`, `true` in both light and dark        | Target-end arrow pointing toward `target`                                                                             |
| `arrowSize`    | `EdgeStyleValue<number>`   | Derived from line width                                 | Length along the path; use a finite positive explicit length. Nonpositive values use automatic length                 |
| `hitAreaWidth` | `EdgeStyleValue<number>`   | Final `lineWidth`                                       | Total picking width, independent of visual width; see [Picking width](#picking-width)                                 |

Line width, hit width, arrow length, and dash periods stay fixed in screen-rendering pixels as the graph zooms.

### Style functions [#options-edge-style-callbacks]

Style functions receive `(source, target, edge)` and use each edge’s data to set its appearance. The preview maps `edge.data` to thin solid, dashed, and bidirectional edges.



```ts
edge: {
  type: 'line',
  style: {
    stroke: (_source, _target, edge) => String(edge.data?.color ?? '#99ADD1'),
    lineWidth: (_source, _target, edge) => Number(edge.data?.width ?? 1),
    lineDash: (_source, _target, edge) => (edge.data?.dash as number[]) ?? [],
    opacity: (_source, _target, edge) => Number(edge.data?.opacity ?? 1),
    startArrow: (_source, _target, edge) => edge.data?.start === true,
    endArrow: (_source, _target, edge) => edge.data?.end === true,
    arrowSize: 16,
    hitAreaWidth: 14,
  },
  stateStyles: { selected: { stroke: '#873bf4', lineWidth: 6 } },
},
```

**Complete runnable code**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const rows = [
    { id: 'Plain', y: 60, width: 1.5, color: '#64748b', dash: [], start: false, end: false, opacity: 1 },
    { id: 'Dash', y: 150, width: 3, color: '#f6903d', dash: [8, 8], start: false, end: true, opacity: 0.7 },
    { id: 'Both', y: 240, width: 5, color: '#1783FF', dash: [], start: true, end: true, opacity: 1 },
  ];
  const graph = new Graph({
    container,
    data: {
      nodes: rows.flatMap((row) => [
        { id: `${row.id}-source`, x: 100, y: row.y, data: { label: row.id } },
        { id: `${row.id}-target`, x: 440, y: row.y },
      ]),
      edges: rows.map((row) => ({
        id: row.id, source: `${row.id}-source`, target: `${row.id}-target`, data: row,
      })),
    },
    node: { style: { size: 20, label: (node) => String(node.data?.label ?? '') } },
    // #region edge-options
    edge: {
      type: 'line',
      style: {
        stroke: (_source, _target, edge) => String(edge.data?.color ?? '#99ADD1'),
        lineWidth: (_source, _target, edge) => Number(edge.data?.width ?? 1),
        lineDash: (_source, _target, edge) => (edge.data?.dash as number[]) ?? [],
        opacity: (_source, _target, edge) => Number(edge.data?.opacity ?? 1),
        startArrow: (_source, _target, edge) => edge.data?.start === true,
        endArrow: (_source, _target, edge) => edge.data?.end === true,
        arrowSize: 16,
        hitAreaWidth: 14,
      },
      stateStyles: { selected: { stroke: '#873bf4', lineWidth: 6 } },
    },
    // #endregion edge-options
    behaviors: ['click-select'],
    autoFit: { padding: 48, maxZoom: 1 },
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



### Dash rules [#dash-rules]

Use `lineDash` to draw a dashed edge. Its first two values add up to the dash period. This example uses a `lineWidth` of `3` to compare a solid line and two dash spacings.



```ts
const rows = [
  { id: 'Solid', y: 0, dash: [] },
  { id: 'Short dashes', y: 75, dash: [4, 4] },
  { id: 'Long dashes', y: 150, dash: [8, 8] },
];
const edge: EdgeConfig = {
  type: 'line',
  style: {
    lineWidth: 3,
    endArrow: false,
    lineDash: (_source, _target, edge) => (edge.data?.dash as number[] | undefined) ?? [],
  },
};
```

**Complete runnable code**

```ts
import { Graph, type EdgeConfig } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region dash-options
  const rows = [
    { id: 'Solid', y: 0, dash: [] },
    { id: 'Short dashes', y: 75, dash: [4, 4] },
    { id: 'Long dashes', y: 150, dash: [8, 8] },
  ];
  const edge: EdgeConfig = {
    type: 'line',
    style: {
      lineWidth: 3,
      endArrow: false,
      lineDash: (_source, _target, edge) => (edge.data?.dash as number[] | undefined) ?? [],
    },
  };
  // #endregion dash-options
  const graph = new Graph({
    container,
    data: {
      nodes: rows.flatMap(({ id, y }) => [
        { id: id + '-source', x: 0, y },
        { id: id + '-target', x: 320, y },
      ]),
      edges: rows.map(({ id, dash }) => ({
        id,
        source: id + '-source',
        target: id + '-target',
        data: { dash },
      })),
    },
    node: { style: { size: 16 } },
    edge: {
      ...edge,
      style: { ...edge.style, label: (_source, _target, edge) => edge.id ?? '', labelFontSize: 12 },
    },
    autoFit: { padding: 48, maxZoom: 1 },
    behaviors: [],
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





### Arrows [#arrows]

Use `startArrow` and `endArrow` to control arrows at both ends and `arrowSize` to set their length.



```ts
edge: {
  type: 'line',
  style: {
    stroke: '#99ADD1',
    lineWidth: (_source, _target, edge) => Number(edge.data?.lw ?? 2),
    endArrow: (_source, _target, edge) => edge.data?.dir !== 'none',
    startArrow: (_source, _target, edge) => edge.data?.dir === 'both',
  },
},
```

**Complete runnable code**

```ts
/**
 * Demo: Arrow directions - none / forward / bidirectional
 */
import { Graph } from '@antv/g6-lite';

export async function runGraph(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'n1', name: 'No arrow', x: 80, y: 120 },
        { id: 't1', name: '', x: 280, y: 120 },
        { id: 'n2', name: 'Forward', x: 400, y: 120 },
        { id: 't2', name: '', x: 600, y: 120 },
        { id: 'n3', name: 'Bidirectional', x: 80, y: 280 },
        { id: 't3', name: '', x: 280, y: 280 },
        { id: 'n4', name: 'Thick + arrow', x: 400, y: 280 },
        { id: 't4', name: '', x: 600, y: 280 },
      ],
      edges: [
        { source: 'n1', target: 't1', data: { dir: 'none' } },
        { source: 'n2', target: 't2', data: { dir: 'forward' } },
        { source: 'n3', target: 't3', data: { dir: 'both' } },
        { source: 'n4', target: 't4', data: { dir: 'forward', lw: 6 } },
      ],
    },
    node: { type: 'circle', style: { fill: '#5B8FF9', size: 24, label: (node) => node.name ?? '' } },
    // #region arrow-options
    edge: {
      type: 'line',
      style: {
        stroke: '#99ADD1',
        lineWidth: (_source, _target, edge) => Number(edge.data?.lw ?? 2),
        endArrow: (_source, _target, edge) => edge.data?.dir !== 'none',
        startArrow: (_source, _target, edge) => edge.data?.dir === 'both',
      },
    },
    // #endregion arrow-options
    theme: 'light',
  });

  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}

export async function run(container: string | HTMLElement) {
  const graph = await runGraph(container);
  return {
    getData: () => graph.getData(),
    fitView: () => graph.fitView({ padding: 64 }),
    destroy: () => graph.destroy(),
  };
}
```



[Arrow sizes and defaults](/en/docs/api/options#config-edge-style)

<span id="picking-width" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="thin-edge-hit-areas" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## Hit area [#hit-area]

Use `hitAreaWidth` to widen the area that detects pointer input while keeping the stroke width. This example enables selection with `click-select`.



```ts
edge: {
  type: 'line',
  style: {
    stroke: '#64748b',
    lineWidth: 1.5,
    endArrow: false,
    hitAreaWidth: (_source, _target, edge) => edge.id === 'wide' ? 24 : 2,
  },
  stateStyles: { selected: { stroke: '#873bf4' } },
},
behaviors: ['click-select'],
```

**Complete runnable code**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'narrow-source', x: 100, y: 80, data: { label: 'Width 2' } },
        { id: 'narrow-target', x: 440, y: 80 },
        { id: 'wide-source', x: 100, y: 200, data: { label: 'Width 24' } },
        { id: 'wide-target', x: 440, y: 200 },
      ],
      edges: [
        { id: 'narrow', source: 'narrow-source', target: 'narrow-target' },
        { id: 'wide', source: 'wide-source', target: 'wide-target' },
      ],
    },
    node: { style: { size: 20, label: (node) => String(node.data?.label ?? '') } },
    // #region hit-area
    edge: {
      type: 'line',
      style: {
        stroke: '#64748b',
        lineWidth: 1.5,
        endArrow: false,
        hitAreaWidth: (_source, _target, edge) => edge.id === 'wide' ? 24 : 2,
      },
      stateStyles: { selected: { stroke: '#873bf4' } },
    },
    behaviors: ['click-select'],
    // #endregion hit-area
    autoFit: { padding: 48, maxZoom: 1 },
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





<span id="options-edge-state-styles" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## State styles [#state-styles]

Use [`edge.stateStyles`](/en/docs/api/options#config-edge-state-style) to set appearance by state. Click an edge to see its purple selection style.



```ts
edge: {
  style: { stroke: '#64748B', lineWidth: 2, hitAreaWidth: 14 },
  stateStyles: {
    selected: { stroke: '#7C3AED', lineWidth: 5 },
  },
},
behaviors: ['click-select'],
```

**Complete runnable code**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'api', x: 0, y: 0 },
        { id: 'db', x: 200, y: -55 },
        { id: 'cache', x: 200, y: 55 },
      ],
      edges: [
        { id: 'api-db', source: 'api', target: 'db', states: ['selected'] },
        { id: 'api-cache', source: 'api', target: 'cache' },
      ],
    },
    node: { style: { size: 20 } },
    // #region state-styles
    edge: {
      style: { stroke: '#64748B', lineWidth: 2, hitAreaWidth: 14 },
      stateStyles: {
        selected: { stroke: '#7C3AED', lineWidth: 5 },
      },
    },
    behaviors: ['click-select'],
    // #endregion state-styles
    autoFit: { padding: 48, maxZoom: 1 },
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



<span id="parallel-edges" style="{ scrollMarginTop: '8rem' }" />

<span id="parallel-edges-and-self-loops" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## Parallel-edge spacing [#parallel-edge-spacing]

Separate multiple relationships between the same two nodes with parallel edges. A self-loop connects a node to itself.

### Separate same-direction and reverse edges [#separate-same-direction-and-reverse-edges]

Use `edge.parallelEdges` to separate overlapping edges between the same two nodes. The top row shows three A→B edges and a purple self-loop on B. The bottom row shows a pair in opposite directions.



```ts
const selfLoop = { id: 'bb', source: 'B', target: 'B' };
const parallelEdges = { enabled: true, offset: 48, includeReverse: true, maxOffset: 100 };
const edge: EdgeConfig = {
  type: 'line',
  parallelEdges,
  style: {
    endArrow: true,
    lineWidth: 2,
    stroke: (_source, _target, edge) => {
      if (edge.source === edge.target) return '#7c3aed';
      return edge.source === 'D' ? '#f6903d' : '#1783ff';
    },
  },
};
```

**Complete runnable code**

```ts
import { Graph, type EdgeConfig } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  // #region separation
  const selfLoop = { id: 'bb', source: 'B', target: 'B' };
  const parallelEdges = { enabled: true, offset: 48, includeReverse: true, maxOffset: 100 };
  const edge: EdgeConfig = {
    type: 'line',
    parallelEdges,
    style: {
      endArrow: true,
      lineWidth: 2,
      stroke: (_source, _target, edge) => {
        if (edge.source === edge.target) return '#7c3aed';
        return edge.source === 'D' ? '#f6903d' : '#1783ff';
      },
    },
  };
  // #endregion separation
  let { enabled, offset, includeReverse } = parallelEdges;
  const options = () => ({ ...parallelEdges, enabled, offset, includeReverse });
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 0, y: 0 }, { id: 'B', x: 260, y: 0 },
        { id: 'C', x: 0, y: 150 }, { id: 'D', x: 260, y: 150 },
      ],
      edges: [
        { id: 'ab1', source: 'A', target: 'B' },
        { id: 'ab2', source: 'A', target: 'B' },
        { id: 'ab3', source: 'A', target: 'B' },
        selfLoop,
        { id: 'cd', source: 'C', target: 'D' },
        { id: 'dc', source: 'D', target: 'C' },
      ],
    },
    node: { style: { size: 26, label: (node) => node.id, labelPlacement: 'bottom' } },
    edge,
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
    autoFit: { padding: [90, 64, 64, 64], maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:10px;background:#fff;color:#334155;padding:4px 8px;font:12px system-ui;pointer-events:none;';
  const applySeparationOptions = () => {
    // #region update
    graph.updateOptions({ edge: { parallelEdges: options() } });
    // #endregion update
  };
  const updateStatus = () => {
    status.textContent = `enabled: ${enabled} · offset: ${offset} · includeReverse: ${includeReverse} · A→B: ${graph.getEdges().filter((edge) => edge.source === 'A').length}`;
  };
  const actions: Array<[string, () => void]> = [
    ['Toggle separation', () => {
      enabled = !enabled;
      applySeparationOptions();
    }],
    ['Spacing 24 / 64', () => {
      offset = offset === 24 ? 64 : 24;
      applySeparationOptions();
    }],
    ['Toggle reverse group', () => {
      includeReverse = !includeReverse;
      applySeparationOptions();
    }],
    // #region mutation
    ['Add ab4', () => { if (!graph.getEdgeData('ab4')) graph.addEdge({ id: 'ab4', source: 'A', target: 'B' }); }],
    ['Remove ab4', () => { graph.removeEdge('ab4'); }],
    // #endregion mutation
  ];
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy(); status.remove(); destroy();
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    for (const [label, action] of actions) {
      ui.addAction(label, () => { action(); updateStatus(); });
    }
    container.append(status);
    updateStatus();
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



### Adjust parallel-edge spacing and grouping [#grouping-and-spacing]

Set `edge.parallelEdges` in `new Graph()` to enable separation and configure it. This works with `line` and `arc`.

```ts
const graph = new Graph({
  container,
  data,
  edge: {
    type: 'line',
    parallelEdges: { enabled: true, offset: 48, includeReverse: true },
  },
});
```

* **Spacing**. Click **Spacing 24 / 64** above and compare the three A→B edges. Increasing `offset` from `24` to `64` makes the two outer edges bend farther apart.
* **Grouping**. `includeReverse: true` puts C→D and D→C in the same group, separating them. Click **Toggle reverse group** to set it to `false`. Each edge forms its own group and the pair overlaps in the example.

After rendering, use `updateOptions()` to change the spacing. It replaces the entire `parallelEdges` object, so include the settings you want to keep.

```ts
graph.updateOptions({
  edge: { parallelEdges: { enabled: true, offset: 64, includeReverse: true } },
});
```

See [ParallelEdgesConfig](/en/docs/api/options#config-parallel-edge-fields) for units, offset limits, and grouping rules.

### Configure parallel edges in transforms [#entries-and-precedence]

If you configure data processing in `transforms`, `process-parallel-edges` gives you the same behavior. Either option works on its own.

```ts
const graph = new Graph({
  container,
  data,
  transforms: [
    { type: 'process-parallel-edges', options: { offset: 24 } },
  ],
});
```

If you set the same option in both places, `edge.parallelEdges` takes priority. With `offset: 48` in the edge config and `offset: 24` in the transform, the graph uses `48`. Set `edge.parallelEdges` to `false` to turn separation off.

### Add or remove parallel edges [#update-after-adding-or-removing-edges]

When parallel-edge separation is enabled, adding or removing an edge automatically rearranges the edges in its group. Click **Add ab4** above to add a fourth A→B edge. The existing edges move to make room.

```ts
graph.addEdge({ id: 'ab4', source: 'A', target: 'B' });
```

Click **Remove ab4** to delete the new edge and return to three A→B edges.

```ts
graph.removeEdge('ab4');
```

### Self-loops and labels [#self-loops-and-labels]

Set `source` and `target` to the same node to draw a loop. Drag a node to see its loops and labels move with it.



```ts
data: {
  nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 220, y: 0 }],
  edges: [
    { id: 'a1', source: 'A', target: 'A' },
    { id: 'b1', source: 'B', target: 'B' },
    { id: 'b2', source: 'B', target: 'B' },
    { id: 'b3', source: 'B', target: 'B' },
  ],
},
```

**Complete runnable code**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    // #region loops
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 220, y: 0 }],
      edges: [
        { id: 'a1', source: 'A', target: 'A' },
        { id: 'b1', source: 'B', target: 'B' },
        { id: 'b2', source: 'B', target: 'B' },
        { id: 'b3', source: 'B', target: 'B' },
      ],
    },
    // #endregion loops
    node: { style: { size: 32, label: (node) => node.id, labelPlacement: 'bottom' } },
    edge: {
      type: 'line',
      parallelEdges: false,
      style: {
        endArrow: true, stroke: '#7c3aed', lineWidth: 2,
        label: (_source, _target, edge) => edge.id ?? '',
        labelBackground: '#fff', labelBackgroundPadding: 3,
      },
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'click-select'],
    autoFit: { padding: 64, maxZoom: 1 },
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



The renderer sets loop sizes and levels. `parallelEdges` spacing applies to edges between distinct endpoints.

<span id="curves-and-polyline-routing" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="edge-polyline" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## Polyline routing [#polyline-routing]

Set `edge.type: 'polyline'`, then choose a path with `router`. See [EdgeConfig.style](/en/docs/api/options#config-edge-style) for fields and defaults.

<span id="choosing-a-router" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### Choose a router [#choose-a-router]

| Router     | Use                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------ |
| `orth`     | Flowcharts. Connects endpoints with horizontal and vertical segments and supports `radius` |
| `tree`     | Hierarchies. Assigns ports to edges from the same source and draws smooth curves           |
| `indented` | Directory trees. Connects children to a parent trunk                                       |
| `fishbone` | Fishbone diagrams. Pair with the `fishbone` layout                                         |

### Orthogonal connections and rounding [#orthogonal-connections-and-rounding]

Orthogonal edges use horizontal and vertical segments. Set **Radius** to `0` for square corners or `16` for rounded corners.



```ts
const layout = {
  type: 'dagre', rankdir: 'LR',
  nodesep: 40, ranksep: 96, nodeSize: [84, 32],
} satisfies LayoutConfig;
const edge: EdgeConfig = {
  type: 'polyline',
  style: { router: 'orth', radius: 16, endArrow: true, lineWidth: 2 },
};
```

**Complete runnable code**

```ts
import { Graph, type EdgeConfig, type LayoutConfig } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  // #region routing
  const layout = {
    type: 'dagre', rankdir: 'LR',
    nodesep: 40, ranksep: 96, nodeSize: [84, 32],
  } satisfies LayoutConfig;
  const edge: EdgeConfig = {
    type: 'polyline',
    style: { router: 'orth', radius: 16, endArrow: true, lineWidth: 2 },
  };
  // #endregion routing
  const graph = new Graph({
    container,
    data: {
      nodes: ['A', 'B', 'C', 'D'].map((id) => ({ id })),
      edges: [
        { id: 'A-B', source: 'A', target: 'B' },
        { id: 'A-C', source: 'A', target: 'C' },
        { id: 'B-D', source: 'B', target: 'D' },
        { id: 'C-D', source: 'C', target: 'D' },
      ],
    },
    node: {
      type: 'rect',
      style: { width: 84, height: 32, borderRadius: 5, label: (node) => node.id, labelPlacement: 'center', labelColor: '#fff' },
    },
    layout,
    edge,
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 48, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); destroy(); };
  try {
    await graph.render();
    ui.addChoice('Radius', ['0', '16'], '16', (value) => {
      const radius = Number(value);
      // #region rounding
      graph.updateOptions({ edge: { style: { radius } } });
      // #endregion rounding
    });
    ui.addChoice<'LR' | 'TB'>('Direction', ['LR', 'TB'], 'LR', async (rankdir) => {
      try {
        graph.setLayout({ ...layout, rankdir });
        await graph.render();
      } catch {
        if (!graph.destroyed) ui.setStatus('Layout failed');
      }
    });
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



### Indented directory connections [#indented-directory-connections]

Pair the `indented` layout and router to connect children to a parent trunk. The example sets `direction: 'LR'`.



```ts
layout: { type: 'indented', direction: 'LR', indent: 160, rowHeight: 70 },
edge: {
  type: 'polyline',
  style: { router: 'indented', indentTarget: 'left', radius: 10, lineWidth: 2, hitAreaWidth: 12 },
  stateStyles: { selected: { stroke: '#873bf4' } },
},
```

**Complete runnable code**

```ts
import { Graph, register } from '@antv/g6-lite';
import indented from '@antv/g6-lite/layouts/indented';

export async function run(container: HTMLElement) {
  register('layout', 'indented', indented);
  const graph = new Graph({
    container,
    data: {
      nodes: ['Root', 'Group', 'Item', 'Other'].map((id) => ({ id })),
      edges: [
        { id: 'root-group', source: 'Root', target: 'Group' },
        { id: 'group-item', source: 'Group', target: 'Item' },
        { id: 'root-other', source: 'Root', target: 'Other' },
      ],
    },
    node: {
      type: 'rect',
      style: { width: 80, height: 28, borderRadius: 5, label: (node) => node.id, labelPlacement: 'center', labelColor: '#fff' },
    },
    // #region routing
    layout: { type: 'indented', direction: 'LR', indent: 160, rowHeight: 70 },
    edge: {
      type: 'polyline',
      style: { router: 'indented', indentTarget: 'left', radius: 10, lineWidth: 2, hitAreaWidth: 12 },
      stateStyles: { selected: { stroke: '#873bf4' } },
    },
    // #endregion routing
    behaviors: ['click-select'],
    autoFit: { padding: 48, maxZoom: 1 },
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



Adjust indentation and row spacing with `layout.indent` and `layout.rowHeight`.

<span id="indented-targets-and-trunks" style="{ display: 'block', scrollMarginTop: '8rem' }" />

#### Choose where edges meet child nodes [#choose-indenttarget]

In a horizontal directory tree, set `indentTarget` to `left` to connect to the side of the child rectangle closest to its parent, as shown above.

```ts
edge: {
  type: 'polyline',
  style: { router: 'indented', indentTarget: 'left' },
},
```

For text-only child nodes, use `right` to extend the line to the end of the text. Switch between **有背景** (with background) and **无样式** (text only) in the [indented tree example](/en/docs/examples/indented-tree) to see both options.

### Set the direction of polylines [#direction-and-updates]

Polylines follow the layout direction. For Dagre, `rankdir: 'LR'` goes left to right and `rankdir: 'TB'` goes top to bottom. Use **Direction** in the [orthogonal connections example](#orthogonal-connections-and-rounding) to compare them.

```ts
graph.setLayout({ type: 'dagre', rankdir: 'TB', nodeSize: [84, 32] });
await graph.render();
```

For the indented layout, `direction: 'LR'` indents to the right and `direction: 'RL'` indents to the left.

## Edge labels [#edge-labels]

Set the relationship name with `edge.style.label` and its position along the edge with `labelPlacement`. The preview compares labels near the start, in the middle, and near the end.



```ts
edge: {
  type: 'line',
  style: {
    lineWidth: 2,
    hitAreaWidth: 12,
    label: (_s, _t, edge) => String(edge.id),
    labelPlacement: (_s, _t, edge) => edge.data?.placement as EdgeLabelPlacement,
    labelFontSize: 12,
    labelColor: '#334155',
    labelBackground: (_s, _t, edge) => edge.id === 'start' ? false : '#eef2ff',
    labelBackgroundPadding: 4,
    labelAutoRotate: true,
  },
  stateStyles: { selected: { stroke: '#873bf4' } },
},
```

**Complete runnable code**

```ts
import { Graph, type EdgeLabelPlacement } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const rows = ['start', 'center', 'end'] as const;
  const graph = new Graph({
    container,
    data: {
      nodes: rows.flatMap((id, index) => [
        { id: id + '-s', x: 100, y: 50 + index * 90 },
        { id: id + '-t', x: 440, y: 80 + index * 90 },
      ]),
      edges: rows.map((id) => ({ id, source: id + '-s', target: id + '-t', data: { placement: id } })),
    },
    node: { style: { size: 20 } },
    // #region edge-label-options
    edge: {
      type: 'line',
      style: {
        lineWidth: 2,
        hitAreaWidth: 12,
        label: (_s, _t, edge) => String(edge.id),
        labelPlacement: (_s, _t, edge) => edge.data?.placement as EdgeLabelPlacement,
        labelFontSize: 12,
        labelColor: '#334155',
        labelBackground: (_s, _t, edge) => edge.id === 'start' ? false : '#eef2ff',
        labelBackgroundPadding: 4,
        labelAutoRotate: true,
      },
      stateStyles: { selected: { stroke: '#873bf4' } },
    },
    // #endregion edge-label-options
    label: { hideOnCollision: false, hideOnLowZoom: false },
    behaviors: ['click-select'],
    autoFit: { padding: 48, maxZoom: 1 },
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



| Field                    | Type                                           | Default and rules                                                                    |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| `label`                  | `EdgeStyleValue<string \| false>`              | `false`; only nonempty strings render, while empty strings or `false` hide the label |
| `labelFontSize`          | `EdgeStyleValue<number>`                       | `10` screen pixels; use a finite positive value                                      |
| `labelFontFamily`        | `EdgeStyleValue<string>`                       | System sans-serif stack                                                              |
| `labelColor`             | `EdgeStyleValue<string>`                       | `'#666'`, independent of line color                                                  |
| `labelPlacement`         | `EdgeStyleValue<'start' \| 'center' \| 'end'>` | `'center'`; path parameters `t = 0.2 / 0.5 / 0.8`, not exact endpoints               |
| `labelBackground`        | `EdgeStyleValue<string \| false>`              | `'rgba(255,255,255,0.8)'`; `false` disables the background                           |
| `labelBackgroundPadding` | `EdgeStyleValue<number>`                       | `2` screen pixels around the background; use a finite nonnegative value              |
| `labelAutoRotate`        | `EdgeStyleValue<boolean>`                      | `true`; follow the tangent while keeping text upright. `false` keeps text horizontal |

### Label background styles [#edge-label-background]

Set the background with `labelBackground` and its padding with `labelBackgroundPadding`. The `start` label above has its background turned off.

### Position and visibility [#position-and-visibility]

Labels on `cubic` and `polyline` edges use the line between endpoints for position and rotation. Font size and visibility follow [global label policies](/en/docs/guides/label#global-label-policies). The `hidden` state of the edge and its endpoints also affects visibility.

### labelRenderer [#edge-label-renderer]

Set `edge.labelRenderer` to choose how labels are drawn. The `demo-multiline` renderer below draws the protocol and request type on separate lines.



```ts
edge: {
  type: 'arc',
  labelRenderer: 'demo-multiline',
  style: {
    label: (_source, _target, edge) => String(edge.data?.label ?? ''),
    labelFontSize: 10,
    labelBackground: 'rgba(255,255,255,0.9)',
    labelBackgroundPadding: 3,
    labelAutoRotate: true,
  },
},
```

**Complete runnable code**

```ts
/**
 * Demo: unified custom node/edge LabelRenderer lifecycle.
 * The multiline behavior lives entirely in this demo, not in G6Lite core.
 */
import { Graph, register, type LabelRenderer } from '@antv/g6-lite';

interface MultilineLayoutData {
  lines: string[];
  lineHeight: number;
  contentWidth: number;
}

// #region renderer
const multilineRenderer: LabelRenderer<MultilineLayoutData> = {
  measure({ ctx, text, style }) {
    ctx.font = `${style.labelFontWeight} ${style.labelFontSize}px ${style.labelFontFamily}`;
    const lines = text.split('\n');
    const lineHeight = style.labelFontSize * 1.2;
    const contentWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
    const padding = style.labelBackgroundPadding;
    return {
      width: contentWidth + padding * 2,
      height: lines.length * lineHeight + padding * 2,
      data: { lines, lineHeight, contentWidth },
    };
  },
  draw({ ctx, style, layout }) {
    const data = layout.data;
    if (!data) return;
    if (style.labelBackground) {
      ctx.fillStyle = style.labelBackground;
      ctx.fillRect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    }
    ctx.font = `${style.labelFontWeight} ${style.labelFontSize}px ${style.labelFontFamily}`;
    ctx.fillStyle = style.labelColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    data.lines.forEach((line, index) => {
      const y = (index - (data.lines.length - 1) / 2) * data.lineHeight;
      ctx.fillText(line, 0, y);
    });
  },
};

register('label', 'demo-multiline', multilineRenderer);
// #endregion renderer

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    // Labels are two lines and hang below nodes (labelPlacement: 'bottom');
    // the bottom padding reserves their height so they stay inside the view.
    autoFit: { padding: [24, 48, 64, 48] },
    container,
    data: {
      nodes: [
        { id: 'source', data: { label: 'Source Service\nShanghai' } },
        { id: 'gateway', data: { label: 'API Gateway\nPrimary' } },
        { id: 'target', data: { label: 'Target Store\nHangzhou' } },
      ],
      edges: [
        { source: 'source', target: 'gateway', data: { label: 'HTTPS\nrequest' } },
        { source: 'gateway', target: 'target', data: { label: 'RPC\nresponse' } },
      ],
    },
    layout: { type: 'dagre', rankdir: 'LR', nodeSize: 32, ranksep: 180 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
    // #region node-label
    node: {
      labelRenderer: 'demo-multiline',
      style: {
        size: 32,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'bottom',
        labelFontSize: 12,
        labelBackground: 'rgba(255,255,255,0.92)',
        labelBackgroundPadding: 4,
      },
    },
    // #endregion node-label
    // #region edge-label
    edge: {
      type: 'arc',
      labelRenderer: 'demo-multiline',
      style: {
        label: (_source, _target, edge) => String(edge.data?.label ?? ''),
        labelFontSize: 10,
        labelBackground: 'rgba(255,255,255,0.9)',
        labelBackgroundPadding: 3,
        labelAutoRotate: true,
      },
    },
    // #endregion edge-label
  });
  await graph.render();
  return graph;
}
```



See [Custom Label Renderer](/en/docs/guides/custom-label-renderer) to implement and register a renderer.

## Develop a custom edge [#custom-edge]

Use an `EdgeExtension` to package a reusable path and appearance. See [Custom edges](/en/docs/guides/custom-edge) for registration, configuration, and a runnable example.

## Update edges dynamically [#update-edges-dynamically]

<span id="runtime-updates" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="options-edge-runtime-updates" style="{ display: 'block', scrollMarginTop: '8rem' }" />

Update one edge’s data or change the graph-wide style after rendering. **Lower SQL latency** updates the SQL edge, and **Set edge color** recolors both edges.



```ts
panel.addAction('Lower SQL latency', () => {
  graph.updateEdgeData('api-db', { latency: 60 });
});
panel.addAction('Set edge color', () => {
  graph.updateOptions({ edge: { style: { stroke: '#1783FF' } } });
});
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
        { id: 'API', x: 0, y: 0 },
        { id: 'DB', x: 230, y: -55 },
        { id: 'Cache', x: 230, y: 55 },
      ],
      edges: [
        { id: 'api-db', source: 'API', target: 'DB', data: { protocol: 'SQL', latency: 120 } },
        { id: 'api-cache', source: 'API', target: 'Cache', data: { protocol: 'TCP', latency: 24 } },
      ],
    },
    node: { style: { size: 24, label: (node) => node.id } },
    edge: {
      style: {
        stroke: '#64748B',
        lineWidth: (_source, _target, edge) => Number(edge.data?.latency ?? 0) >= 100 ? 4 : 2,
        label: (_source, _target, edge) => `${edge.data?.protocol} · ${edge.data?.latency} ms`,
        labelAutoRotate: false,
      },
    },
    autoFit: { padding: 56, maxZoom: 1 },
    behaviors: [],
  });
  const panel = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    panel.destroy();
    destroy();
  };
  try {
    await graph.render();
    // #region edge-updates
    panel.addAction('Lower SQL latency', () => {
      graph.updateEdgeData('api-db', { latency: 60 });
    });
    panel.addAction('Set edge color', () => {
      graph.updateOptions({ edge: { style: { stroke: '#1783FF' } } });
    });
    // #endregion edge-updates
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



See [`updateEdgeData()`](/en/docs/api/graph#updateedgedata) and [`updateOptions()`](/en/docs/api/graph#updateoptions) for more operations.

## Common questions [#common-questions]

### Why do parallel edges still overlap? [#why-do-parallel-edges-still-overlap]

Check that `enabled` is `true` and the type is `line` or `arc`, then check `maxOffset` and `includeReverse`.

### Why does offset not resize self-loops? [#why-does-offset-not-resize-self-loops]

The renderer sizes self-loops. `offset` controls parallel-edge spacing.

### Why is a thin line still difficult to select? [#why-is-a-thin-line-still-difficult-to-select]

Use `hitAreaWidth` with an interaction such as `click-select`.

### Why is a label missing? [#why-is-a-label-missing]

Check that `edge.style.label` returns text, then check zoom, collisions, and whether the edge or an endpoint is hidden.

### Why doesn't changing the router at runtime work? [#why-do-router-or-trunkgap-changes-do-nothing]

After setting a new `router` with `updateOptions()`, call `render()` to rebuild the polyline paths.

### Why does an edge cross another node? [#why-does-an-edge-cross-another-node]

`orth` routes from the two endpoints. Adjust layout or node spacing to keep edges clear of other nodes.

### Why does a configured state not activate? [#why-does-a-configured-state-not-activate]

Activate the state with a behavior or `setItemState(edgeId, state, true)`.

### Why does a line miss the node boundary? [#why-does-a-line-miss-the-node-boundary]

Check node dimensions, layout `nodeSize`, and direction. Use `indentTarget: 'left'` for rectangles in horizontal directory trees.

### Why does the label not follow the polyline? [#why-does-the-label-not-follow-the-polyline]

`polyline` labels use the line between endpoints for position and rotation.

<span id="other-configuration" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## Related [#related]

* [EdgeConfig overview](/en/docs/api/options#options-edge)
* [Data model](/en/docs/guides/data#nodes-edges-and-groups): edge identity, endpoints, and business attributes.
* [Interactions](/en/docs/guides/behaviors): behavior combinations and selection.
* [Labels and icons](/en/docs/guides/label): label usage across nodes and edges.
* [Examples](/en/docs/examples): more scenarios and runnable cases.

**Related runnable examples**

* [Edge arrow directions](/en/docs/examples/edge-arrows)
* [Edge types](/en/docs/examples/edge-types)
* [Edge colors](/en/docs/examples/edge-colors)
* [Edge states and weight](/en/docs/examples/edge-states)
* [Hit area](/en/docs/examples/edge-hit-area)
* [Parallel and reverse edges](/en/docs/examples/parallel-edges)
* [Self-loops](/en/docs/examples/edge-loops)
* [Polylines and orthogonal routing](/en/docs/examples/polyline-routing)
