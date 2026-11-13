# Common node options (/en/docs/guides/node)





<span id="options-node" style="{ display: 'block', scrollMarginTop: '8rem' }" />

Use `GraphOptions.node` to choose a shape, configure its appearance, or use a registered node type. See the [node overview](/en/docs/elements/node) for the data structure and configuration methods.

<span id="top-level-configuration" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## NodeConfig [#nodeconfig]

`NodeConfig` is the `node` option passed to `new Graph()`. Every field is optional. This example configures a circle with a label and uses `states` to select it on the first render. See [Quick start](/en/docs/getting-started/quick-start) to set up a `#container` element with a width and height.

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: '#container',
  data: {
    nodes: [{ id: 'api', name: 'API', x: 100, y: 80, states: ['selected'] }],
    edges: [],
  },
  node: {
    type: 'circle',
    style: {
      size: 32,
      fill: '#1783FF',
      label: (node) => node.name ?? node.id,
    },
    stateStyles: {
      selected: { stroke: '#1D39C4', strokeWidth: 2, haloWidth: 14 },
    },
  },
});

await graph.render();
```

| Field                                        | Description                           | Type                                                                 | Default or fallback             |
| -------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------- | ------------------------------- |
| [`type`](#types)                             | Built-in type or registered node name | `string`                                                             | `'circle'`                      |
| [`style`](#data-mapping-and-selected-styles) | Node body, label, and icon styles     | `NodeStyleConfig \| ((node: GraphNode) => Partial<NodeStyleConfig>)` | Theme and field fallbacks       |
| [`stateStyles`](#options-node-state-styles)  | Appearance overrides per state        | `Partial<Record<NodeState, NodeStateStyleOverride>>`                 | Extension or theme state styles |
| [`labelRenderer`](#labelrenderer)            | Registered label renderer name        | `string`                                                             | Built-in label renderer         |
| [`decorations`](#nodedecorationconfig)       | Badges or custom decorations          | `NodeDecorationConfig[]`                                             | No decorations                  |

## Type [#types]

<span id="basic-configuration" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="node-circle" style="{ display: 'block', scrollMarginTop: '8rem' }" />

`node.type` takes a string and selects the node type for the whole graph. It defaults to `circle`. Use a built-in type or the name of a registered node extension. To vary color or size by node data, use [per-field style functions](#options-node-style-callbacks).

| Shape requirement               | Type and dimensions                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Dots, people, or device markers | `type: 'circle'`, with diameter set by `size`                                                                      |
| Business cards or wide nodes    | `type: 'rect'`, with `width`, `height`, and `borderRadius`                                                         |
| Reusable business appearance    | Call `register('node', name, extension)` before using that `type`; see [Custom nodes](/en/docs/guides/custom-node) |

## Style [#data-mapping-and-selected-styles]

`node.style` configures the node body, label, label background, and icon. Set the halo in [state styles](#halo-style) and add badges with [`node.decorations`](#nodedecorationconfig).

### Node body styles [#nodestyleconfig]

These `NodeStyleConfig` defaults apply to built-in nodes with a **style object**, including per-field style functions. Omitting `theme` selects the light preset. Custom themes and node extensions can change fallbacks.

| Field          | Type                     | Default or fallback                               | Meaning                                                                     |
| -------------- | ------------------------ | ------------------------------------------------- | --------------------------------------------------------------------------- |
| `fill`         | `NodeStyleValue<string>` | `theme.nodeFill`, preset `'#1783FF'`              | Fill color                                                                  |
| `size`         | `NodeStyleValue<number>` | `theme.nodeSize`, preset `24`                     | Circle diameter; rectangle fallback when dimensions are omitted             |
| `width`        | `NodeStyleValue<number>` | Resolved `size`                                   | Rectangle width; does not change a built-in circle's diameter               |
| `height`       | `NodeStyleValue<number>` | Resolved `size`                                   | Rectangle height; does not change a built-in circle's diameter              |
| `stroke`       | `NodeStyleValue<string>` | `theme.nodeStroke`; light `'#fff'`, dark `'#333'` | Stroke color                                                                |
| `strokeWidth`  | `NodeStyleValue<number>` | `theme.nodeStrokeWidth`, preset `0`               | Stroke width; `0` draws no stroke                                           |
| `opacity`      | `NodeStyleValue<number>` | `1`                                               | Opacity of the node body and halo, from `0` to `1`                          |
| `borderRadius` | `NodeStyleValue<number>` | `0`                                               | Rectangle corner radius, limited when drawing to half the smaller dimension |

`size`, `width`, `height`, `strokeWidth`, and `borderRadius` use graph units and follow camera zoom. Use the [Graph visibility methods](/en/docs/api/graph#state-visibility-and-focus) to hide the entire node, including its label, icon, and badges.

Each rectangle dimension falls back to `size` independently. For example, `style: { size: 40, width: 96 }` gives a rectangle 96 units wide and 40 units tall. The default label position and icon dimensions still use `size` when both rectangle dimensions are explicit.

<span id="node-rect" style="{ display: 'block', scrollMarginTop: '8rem' }" />

This example sets the rectangle width to `96`, height to `40`, and corner radius to `8`. Each node's `data.risk` determines its fill. Click a node to see its selected outline.



```ts
import { Graph, type NodeConfig } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const node: NodeConfig = {
    type: 'rect',
    style: {
      size: 32,
      width: 96,
      height: 40,
      borderRadius: 8,
      fill: (item) => item.data?.risk === 'high' ? '#ff4d4f' : '#1783FF',
      stroke: '#fff',
      strokeWidth: 1,
    },
    stateStyles: {
      selected: { stroke: '#163B65', strokeWidth: 2 },
    },
  };
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'high-risk', x: 120, y: 100, data: { risk: 'high' } },
        { id: 'normal-risk', x: 360, y: 100, data: { risk: 'normal' } },
      ],
      edges: [],
    },
    node,
    autoFit: { padding: 40, maxZoom: 1 },
    behaviors: ['click-select'],
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



### Style functions [#options-node-style-callbacks]

Style functions compute styles from each node's data. For example, a value can determine the node size and a group can determine its color.



```ts
node: {
  type: 'circle',
  style: {
    size: (node) => Number(node.data?.value ?? 24),
    fill: (node) => node.data?.group === 'core' ? '#1783FF' : '#61DDAA',
    label: (node) => `${node.id}: ${node.data?.value}`,
    labelPlacement: 'bottom',
    labelOffsetY: 6,
  },
  stateStyles: {
    selected: { stroke: '#163B65', strokeWidth: 3, haloWidth: 12 },
  },
},
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
        { id: 'A', x: 80, y: 100, data: { value: 16, group: 'core' } },
        { id: 'B', x: 240, y: 100, data: { value: 28, group: 'other' } },
        { id: 'C', x: 400, y: 100, data: { value: 40, group: 'core' } },
      ],
      edges: [{ source: 'A', target: 'B' }, { source: 'B', target: 'C' }],
    },
    // #region node-options
    node: {
      type: 'circle',
      style: {
        size: (node) => Number(node.data?.value ?? 24),
        fill: (node) => node.data?.group === 'core' ? '#1783FF' : '#61DDAA',
        label: (node) => `${node.id}: ${node.data?.value}`,
        labelPlacement: 'bottom',
        labelOffsetY: 6,
      },
      stateStyles: {
        selected: { stroke: '#163B65', strokeWidth: 3, haloWidth: 12 },
      },
    },
    // #endregion node-options
    edge: { style: { stroke: '#94a3b8' } },
    autoFit: { padding: 40, maxZoom: 1 },
    behaviors: ['click-select'],
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy();
    destroy();
  };
  try {
    await graph.render();
    ui.addAction('B: 28 / 40', () => {
      const value = graph.getNodeData('B')?.data?.value === 28 ? 40 : 28;
      graph.updateNodeData('B', { value });
    });
    ui.addAction('Fill', () => {
      graph.updateOptions({ node: { style: { fill: '#7262FD' } } });
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



### Label styles [#labels]

These fields belong in `node.style`. Each accepts a constant or a function.

| Field             | Type                              | Default                 | Meaning                                                                                                            |
| ----------------- | --------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `label`           | `NodeStyleValue<string \| false>` | Not drawn               | Text; `false`, an empty string, or omission draws no label                                                         |
| `labelFontSize`   | `NodeStyleValue<number>`          | `12`                    | Base CSS-pixel font size, converted for DPR and label zoom                                                         |
| `labelFontFamily` | `NodeStyleValue<string>`          | System sans-serif stack | Canvas font family                                                                                                 |
| `labelFontWeight` | `NodeStyleValue<string>`          | `'normal'`              | Canvas font weight, such as `'600'`                                                                                |
| `labelColor`      | `NodeStyleValue<string>`          | `'#333'`                | Text color; does not automatically become white for the dark theme                                                 |
| `labelPlacement`  | `NodeStyleValue<LabelPlacement>`  | `'bottom'`              | `'center'`, `'top'`, `'bottom'`, `'left'`, or `'right'`                                                            |
| `labelOffsetX`    | `NodeStyleValue<number>`          | `0`                     | Base CSS-pixel horizontal offset; positive moves right                                                             |
| `labelOffsetY`    | `NodeStyleValue<number>`          | `0`                     | Base CSS-pixel vertical offset; positive moves down                                                                |
| `labelMaxWidth`   | `NodeStyleValue<number>`          | `0`                     | Default renderer's text width limit; positive values truncate with `...`, nonpositive values leave width unlimited |

Default label placement uses `size`. For rectangles with different widths and heights, fine-tune the position with `labelOffsetX` and `labelOffsetY`. See [global label policies](/en/docs/guides/label#global-label-policies) for fixed font sizes, low-zoom hiding, and collision hiding.

API, Database, and Cache show labels on the left, below, and on the right. Database has no `name`, so the label uses its `id`. Worker, at the far right, has `data.hideLabel` set and only shows the node.



```ts
node: {
  style: {
    size: 40,
    fill: '#1783FF',
    label: (node) => node.data?.hideLabel ? false : (node.name ?? node.id),
    labelPlacement: (node) => (node.data?.placement as LabelPlacement | undefined) ?? 'bottom',
    labelFontSize: 14,
    labelFontWeight: '600',
  },
},
```

**Complete runnable code**

```ts
import { Graph, type LabelPlacement } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'api', name: 'API', x: 100, y: 100, data: { placement: 'left' } },
        { id: 'Database', x: 260, y: 100 },
        { id: 'cache', name: 'Cache', x: 420, y: 100, data: { placement: 'right' } },
        { id: 'worker', name: 'Worker', x: 580, y: 100, data: { hideLabel: true } },
      ],
      edges: [],
    },
    // #region label-style
    node: {
      style: {
        size: 40,
        fill: '#1783FF',
        label: (node) => node.data?.hideLabel ? false : (node.name ?? node.id),
        labelPlacement: (node) => (node.data?.placement as LabelPlacement | undefined) ?? 'bottom',
        labelFontSize: 14,
        labelFontWeight: '600',
      },
    },
    // #endregion label-style
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



### Label background styles [#label-background]

Set `labelBackground` to a color to draw a background behind the text. Padding is measured in base CSS pixels and follows label scaling. Default collision detection uses the measured text box.

| Field                    | Type                              | Default | Meaning                                               |
| ------------------------ | --------------------------------- | ------- | ----------------------------------------------------- |
| `labelBackground`        | `NodeStyleValue<string \| false>` | `false` | Background color; `false` disables it                 |
| `labelBackgroundPadding` | `NodeStyleValue<number>`          | `2`     | Base CSS-pixel padding on each side of the background |

The API and database labels use light blue and light yellow backgrounds, each with `6` pixels of padding. The database name is truncated at `labelMaxWidth: 120`, and the background is capped at that width plus padding on both sides.



```ts
const node: NodeConfig = {
  style: {
    size: 40,
    label: (item) => String(item.data?.name ?? item.id),
    labelPlacement: 'bottom',
    labelMaxWidth: 120,
    labelBackground: (item) => item.id === 'db' ? '#fff1b8' : '#e6f4ff',
    labelBackgroundPadding: 6,
    labelFontWeight: '600',
  },
};
```

**Complete runnable code**

```ts
import { Graph, type NodeConfig } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region node-label
  const node: NodeConfig = {
    style: {
      size: 40,
      label: (item) => String(item.data?.name ?? item.id),
      labelPlacement: 'bottom',
      labelMaxWidth: 120,
      labelBackground: (item) => item.id === 'db' ? '#fff1b8' : '#e6f4ff',
      labelBackgroundPadding: 6,
      labelFontWeight: '600',
    },
  };
  // #endregion node-label
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'api', x: 120, y: 100, data: { name: 'API Server' } },
        { id: 'db', x: 360, y: 100, data: { name: 'Database with a very long name' } },
      ],
      edges: [],
    },
    node,
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



### Icon styles [#icons]

Icon fields also belong in `node.style` and accept constants or per-field style functions.

| Field            | Type                                | Default                 | Applicability and units                                                           |
| ---------------- | ----------------------------------- | ----------------------- | --------------------------------------------------------------------------------- |
| `icon`           | `NodeStyleValue<string \| false>`   | Not drawn               | Image URL or text according to `iconType`; empty strings and `false` draw nothing |
| `iconType`       | `NodeStyleValue<'image' \| 'text'>` | `'image'`               | Image or text icon                                                                |
| `iconWidth`      | `NodeStyleValue<number>`            | Resolved `size` × `0.6` | Image icons only; graph-space width                                               |
| `iconHeight`     | `NodeStyleValue<number>`            | Resolved `size` × `0.6` | Image icons only; graph-space height                                              |
| `iconFontFamily` | `NodeStyleValue<string>`            | System sans-serif stack | Text icons only; load the font in the application                                 |
| `iconFontSize`   | `NodeStyleValue<number>`            | Resolved `size` × `0.6` | Text icons only; graph-space font size, skipped below 4 rendered Canvas pixels    |
| `iconColor`      | `NodeStyleValue<string>`            | `'#fff'`                | Text icons only                                                                   |
| `iconOffsetX`    | `NodeStyleValue<number>`            | `0`                     | Graph-space offset; positive moves right                                          |
| `iconOffsetY`    | `NodeStyleValue<number>`            | `0`                     | Graph-space offset; positive moves down                                           |

Icon sizes and offsets follow camera zoom rather than the `label.scaleWithZoom` text policy. Icons do not participate in label collision hiding or `nodeMinZoom`; hidden nodes still skip drawing. Images load asynchronously and trigger a redraw when ready. Cross-origin images must permit anonymous CORS; failed URLs are not automatically retried by the instance.

<span id="labels-and-icons" style="{ display: 'block', scrollMarginTop: '8rem' }" />

The left node draws `A` as a text icon, and the right node draws the AntV image. Both icons move up `4` graph units, with the node names below. Replace `imageUrl` with an image served by your app.



```ts
node: {
  style: {
    size: 56,
    fill: (node) => node.id === 'image' ? '#e6f4ff' : '#1783ff',
    iconType: (node) => node.id === 'image' ? 'image' : 'text',
    icon: (node) => node.id === 'image' ? imageUrl : 'A',
    iconWidth: 24,
    iconHeight: 21,
    iconOffsetY: -4,
    iconFontSize: 24,
    iconColor: '#fff',
    label: (node) => node.name ?? node.id,
    labelOffsetY: 6,
  },
},
```

**Complete runnable code**

```ts
import { Graph } from '@antv/g6-lite';

const imageUrl = new URL('../src/app/icon.svg', import.meta.url).href;

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'text', name: 'Text', x: 100, y: 100 },
        { id: 'image', name: 'Image', x: 260, y: 100 },
      ],
      edges: [],
    },
    // #region icon-style
    node: {
      style: {
        size: 56,
        fill: (node) => node.id === 'image' ? '#e6f4ff' : '#1783ff',
        iconType: (node) => node.id === 'image' ? 'image' : 'text',
        icon: (node) => node.id === 'image' ? imageUrl : 'A',
        iconWidth: 24,
        iconHeight: 21,
        iconOffsetY: -4,
        iconFontSize: 24,
        iconColor: '#fff',
        label: (node) => node.name ?? node.id,
        labelOffsetY: 6,
      },
    },
    // #endregion icon-style
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



### labelRenderer [#labelrenderer]

`node.labelRenderer` controls how a node label is drawn. In this example, `style.label` supplies the text and `demo-multiline` draws the service name on one line and its location or role on the next.



```ts
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



## Badge decorations [#badge-decorations]

<span id="nodedecorationconfig" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="content-and-visibility" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="placement-and-offsets" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="stacks-and-overflow" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="built-in-badges" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="custom-decoration-renderers" style="{ display: 'block', scrollMarginTop: '8rem' }" />

Use `builtin-badge` in [`node.decorations`](/en/docs/api/options#config-node-decoration) to show counts, warnings, or permission markers beside a node.



```ts
decorations: [{
  renderer: 'builtin-badge',
  placement: 'right',
  attachment: 'boundary',
  anchor: 'start',
  boundaryOverlap: 'half-badge',
  layout: 'stack',
  items: [
    { kind: 'count', value: 12 },
    { kind: 'warning' },
    { kind: 'text', text: 'VIP' },
    { kind: 'lock' },
    { kind: 'favorite' },
  ] satisfies NodeBadgeItem[],
  maxVisible: 3,
  overflow: 'hover-expand',
  overflowData: { kind: 'text', text: '···' },
}],
```

**Complete runnable code**

```ts
import { Graph, type NodeBadgeItem } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: { nodes: [{ id: 'Orders', x: 120, y: 100 }], edges: [] },
    node: {
      style: { size: 64, fill: '#1783FF', label: (node) => node.id },
      // #region badge-options
      decorations: [{
        renderer: 'builtin-badge',
        placement: 'right',
        attachment: 'boundary',
        anchor: 'start',
        boundaryOverlap: 'half-badge',
        layout: 'stack',
        items: [
          { kind: 'count', value: 12 },
          { kind: 'warning' },
          { kind: 'text', text: 'VIP' },
          { kind: 'lock' },
          { kind: 'favorite' },
        ] satisfies NodeBadgeItem[],
        maxVisible: 3,
        overflow: 'hover-expand',
        overflowData: { kind: 'text', text: '···' },
      }],
      // #endregion badge-options
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



The count, warning, and `···` appear first. Hover over `···` to show all five badges.



<span id="state-styles" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## State styles [#options-node-state-styles]

Use [`node.stateStyles`](/en/docs/api/options#config-node-state-style) to style nodes by state. A starts with a selection outline. Click **Toggle review** to add an orange fill.



```ts
stateStyles: {
  selected: { stroke: '#6D28D9', strokeWidth: 3 },
  review: { fill: '#F59E0B' },
  highlight: { fill: '#00A876', stroke: '#005C41', strokeWidth: 2 },
},
```

**Complete runnable code**

```ts
import { Graph, type ElementState } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0, states: ['selected'] }, { id: 'B', x: 220, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: {
      style: { size: 34, label: (node) => node.id, labelOffsetY: 10 },
      // #region state-styles
      stateStyles: {
        selected: { stroke: '#6D28D9', strokeWidth: 3 },
        review: { fill: '#F59E0B' },
        highlight: { fill: '#00A876', stroke: '#005C41', strokeWidth: 2 },
      },
      // #endregion state-styles
    },
    behaviors: [],
    autoFit: { padding: 60, maxZoom: 1 },
  });
  // #region states
  const toggle = (state: ElementState) => {
    const enabled = graph.getItemStates('A').includes(state);
    graph.setItemState('A', state, !enabled);
  };
  const replace = () => graph.setElementStates('A', ['highlight']);
  const clear = () => graph.clearItemStates('A');
  // #endregion states
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.6 system-ui;pointer-events:none;z-index:20;';
  const update = () => {
    status.textContent = `A: [${graph.getItemStates('A').join(', ')}] | B: [${graph.getItemStates('B').join(', ')}]`;
  };
  const actions: Array<[string, () => void]> = [
    ['Toggle selected', () => toggle('selected')],
    ['Toggle review', () => toggle('review')],
    ['Replace with highlight', replace],
    ['Clear A', clear],
  ];
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    update();
    for (const [label, action] of actions) {
      ui.addAction(label, () => { action(); update(); });
    }
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



### Halo styles [#halo-style]

`haloWidth` sets the width of the halo around a node. From left to right, the example shows the default, active, and selected states. Active uses a width of `8` and selected uses `22`.



```ts
stateStyles: {
  active: { haloWidth: 8 },
  selected: { haloWidth: 22 },
},
```

**Complete runnable code**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'Default', x: 0, y: 0 },
        { id: 'Active', x: 140, y: 0, states: ['active'] },
        { id: 'Selected', x: 280, y: 0, states: ['selected'] },
      ],
      edges: [],
    },
    node: {
      style: { size: 40, label: (node) => node.id, labelOffsetY: 22 },
      // #region halo-options
      stateStyles: {
        active: { haloWidth: 8 },
        selected: { haloWidth: 22 },
      },
      // #endregion halo-options
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



## Develop a custom node [#custom-node]

See [Custom nodes](/en/docs/guides/custom-node) to create and register a reusable node type with `NodeExtension`.

## Update nodes dynamically [#update-nodes-dynamically]

<span id="runtime-updates" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="options-node-runtime-updates" style="{ display: 'block', scrollMarginTop: '8rem' }" />

Update node data or graph-wide styles after rendering. Click **Restore DB** to change DB’s status and color, then **Labels on top** to move all node labels above their nodes.



```ts
ui.addAction('Restore DB', () => {
  graph.updateNodeData('DB', { status: 'healthy' });
});
ui.addAction('Labels on top', () => {
  graph.updateOptions({ node: { style: { labelPlacement: 'top', labelOffsetY: -4 } } });
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
        { id: 'API', x: 0, y: 0, data: { status: 'healthy' } },
        { id: 'DB', x: 190, y: 0, data: { status: 'degraded' } },
      ],
      edges: [{ source: 'API', target: 'DB' }],
    },
    node: {
      type: 'rect',
      style: {
        size: 40,
        width: 88,
        height: 36,
        borderRadius: 6,
        fill: (node) => node.data?.status === 'degraded' ? '#D97706' : '#0F766E',
        label: (node) => `${node.id}: ${node.data?.status}`,
        labelOffsetY: 4,
      },
    },
    autoFit: { padding: 64, maxZoom: 1 },
    behaviors: [],
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy();
    destroy();
  };
  try {
    await graph.render();
    // #region runtime-updates
    ui.addAction('Restore DB', () => {
      graph.updateNodeData('DB', { status: 'healthy' });
    });
    ui.addAction('Labels on top', () => {
      graph.updateOptions({ node: { style: { labelPlacement: 'top', labelOffsetY: -4 } } });
    });
    // #endregion runtime-updates
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



See [`updateNodeData()`](/en/docs/api/graph#updatenodedata) and [`updateOptions()`](/en/docs/api/graph#updateoptions) for more operations.

## Common questions [#common-questions]

**Width and height do not change a circle**

Set `type: 'rect'` for rectangles. Built-in circles use `size` instead of rectangle dimensions.

**Clicking does not apply state appearance**

Enable a selection behavior or call a state API. Replace a whole-object style function with per-field style functions when you need state appearance.

**Labels are missing or disappear when zooming out**

Check for nonempty `style.label`, then check top-level label zoom and collision policies; see the [label guide](/en/docs/guides/label#global-label-policies).

**An icon is missing**

Use `iconType: 'text'` for text or `'image'` for URLs, and check URL, cross-origin access, and loading results.

**A custom type or renderer has no effect**

Register before creating or updating configuration. Custom labels also need nonempty `style.label`.

**Fewer items appear than `maxVisible`**

A folded stack reserves an overflow slot. Supply `overflowData` to show it, and use `overflow: 'hover-expand'` for expansion.

**Other states or badges disappear after an update**

`stateStyles` and `decorations` are replaced as whole collections; submit everything you want to retain.

## Performance [#performance]

* Built-in circles and rectangles use WebGL. Prefer constants for uniform appearance and lightweight style functions for data-dependent fields. Avoid fetching data or doing expensive work inside these functions.
* Use state APIs for frequent selection or highlight changes and incremental operations for business-data changes, reducing full data replacements and layout runs.
* Show labels and decorations as needed, with zoom, collision, and item-count limits. Keep custom label and decoration measurement and drawing inexpensive.

## Related resources [#related-resources]

<span id="related-references" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### Choose an example by effect [#choose-an-example-by-effect]

| Configuration to verify                | Runnable example                                                    | Action and expected result                                                                     |
| -------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `type` and basic dimensions            | [Node shapes](/en/docs/examples/shapes)                             | Compare circle and rectangle outlines and dimensions                                           |
| Per-field style functions              | [Data-driven node styles](/en/docs/examples/node-style)             | Compare cluster colors and hub size; hover for relationship highlighting                       |
| State overrides                        | [Default theme and states](/en/docs/examples/default-theme)         | Compare theme and built-in state appearances                                                   |
| `label*`, `icon*`, and runtime updates | [Label placement and icons](/en/docs/examples/labels)               | Change placement, toggle icons and edge labels, and observe each independently                 |
| Global label visibility policies       | [Label rendering policy](/en/docs/examples/label-rendering-options) | Switch policies and zoom to compare text visibility; these policies differ from icon options   |
| `labelRenderer`                        | [Custom label rendering](/en/docs/examples/custom-label-renderer)   | Compare custom content with plain text; inspect registration and configuration in the source   |
| `decorations`                          | [Node badges](/en/docs/examples/decoration-badges)                  | Hover the overflow marker to expand 5 badges and leave to fold; change `maxVisible` to compare |

### Guides and protocols [#guides-and-protocols]

* [Labels and icons](/en/docs/guides/label)
* [Custom Label Renderer](/en/docs/guides/custom-label-renderer)
* [Custom decorations](/en/docs/guides/custom-decoration)
* [Edges](/en/docs/guides/edge)
* [Node stroke and radius](/en/docs/examples/node-border)
