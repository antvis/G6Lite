# Labels and icons (/en/docs/guides/label)





Configure text and placement first, then choose visibility policies. Find full fields in [node labels and icons](/en/docs/guides/node#labels), [edge labels](/en/docs/guides/edge#edge-labels), and the [label policy reference](/en/docs/api/options#options-label).

## Node labels [#node-labels]

1. Set `node.style.label`, or read node data in a callback. data.name does not display automatically.
2. Choose labelPlacement, then fine-tune with labelOffsetX/Y.
3. Set labelFontSize and labelColor. The default renderer handles DPR conversion.

The example places labels to the left, below, and to the right, and hides the fourth node's label.



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



## Node icons [#node-icons]

The left node below uses a text icon, and the right node uses an image icon.

* Text/font icons: set `iconType: 'text'`, then iconFontSize and iconColor. Load the font in your application.
* Images: set `iconType: 'image'` and an image URL, then iconWidth/Height. Loading is asynchronous; cross-origin resources need anonymous CORS.

Icons scale with nodes and do not follow global label threshold/collision hiding. See the [icon reference](/en/docs/guides/node#icons) for fields.



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



## Long text and backgrounds [#long-text-and-backgrounds]

Use labelMaxWidth to truncate default node labels, and labelBackground/labelBackgroundPadding for a background and spacing. The long name below is limited to 120.



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



For special layouts, use a [custom Label Renderer](/en/docs/guides/custom-label-renderer): register it, set node.labelRenderer or edge.labelRenderer, and keep nonempty style.label. Custom drawing handles truncation itself.

## Edge labels [#edge-labels]

Set text in `edge.style.label`. The callback is `(source, target, edge) => text`; its third argument is edge data. Use labelColor independently of the edge stroke.

Compare start, center, and end below, with labelAutoRotate enabled. Low-zoom and collision hiding are disabled for this comparison.



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



Keep default visibility policies where appropriate. Edge text retains screen dimensions; see [position and visibility](/en/docs/guides/edge#position-and-visibility) for curved/polyline limitations.

## Global label policies [#global-label-policies]

Configure the top-level Graph `label` option for your goal:

* Keep text at a fixed screen size: set `scaleWithZoom: false`. This affects node labels; edge labels always keep screen dimensions.
* Adjust when labels appear: set nodeMinZoom and edgeMinZoom. Set one threshold to 0 to bypass it independently.
* Diagnose hidden/overlapping labels: temporarily disable hideOnCollision or hideOnLowZoom, then restore the policies you need.

### Try the visibility controls [#options-label-code-and-matching-result]

The example starts at zoom 0.4 with scaleWithZoom explicitly disabled for readable text. Node labels pass their threshold, while the Request edge label is below 0.5 and hidden. Two nearby node labels collide, retaining the earlier one.

* Disable hideOnCollision to reveal overlapping labels.
* Disable hideOnLowZoom to show the edge label at the current zoom.
* Enable scaleWithZoom, then zoom in/out to compare node and edge text sizes.



```ts
import { Graph, type LabelOptions } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  // #region label-options
  const policy: Required<LabelOptions> = {
    scaleWithZoom: false,
    hideOnLowZoom: true,
    hideOnCollision: true,
    nodeMinZoom: 0.3,
    edgeMinZoom: 0.5,
  };
  // #endregion label-options
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'Client alpha', x: 0, y: 100 },
        { id: 'Client beta', x: 100, y: 100 },
        { id: 'API gateway', x: 900, y: 100 },
      ],
      edges: [{ id: 'Request', source: 'Client beta', target: 'API gateway' }],
    },
    node: { style: { size: 48, label: (node) => node.id, labelFontSize: 14 } },
    edge: { style: { label: (_s, _t, edge) => edge.id ?? '', labelFontSize: 14 } },
    label: policy,
    behaviors: [],
    autoFit: { minZoom: 0.4, maxZoom: 0.4 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); destroy(); };
  try {
    await graph.render();
    const settings = { ...policy };
    for (const key of ['scaleWithZoom', 'hideOnLowZoom', 'hideOnCollision'] as const) {
      ui.gui.add(settings, key).onChange((checked: boolean) => {
        graph.updateOptions({ label: { [key]: checked } });
      });
    }
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



### Zoom thresholds [#zoom-thresholds]

With default low-zoom hiding, labels passing the threshold check are listed below. Content, hidden states, and collisions still determine final visibility.

| Camera zoom      | Node labels          | Edge labels          |
| ---------------- | -------------------- | -------------------- |
| Below 0.3        | Hidden               | Hidden               |
| 0.3 to below 0.5 | Rendering candidates | Hidden               |
| At least 0.5     | Rendering candidates | Rendering candidates |

Set one MinZoom to 0 to bypass only that label type's threshold. Disabling hideOnLowZoom does not disable collision hiding.

Thresholds accept finite nonnegative numbers, including `0`. Negative values, `NaN`, and `Infinity` fall back to the corresponding defaults. Thresholds compare directly against the camera's `zoom`.

### Collision order [#collision-order]

Each frame processes node labels before edge labels, following rendering-data order within each type. Earlier labels reserve space; later overlapping labels are hidden. Recalculation on each frame means zoom or order changes can change the survivors. selected/highlight receive no automatic priority.

#### Collision bounds and custom renderers [#collision-bounds-and-custom-renderers]

Built-in labels use unrotated text rectangles, excluding extra background padding. Custom labelRenderer bounds come from measure's width/height. The policy hides overlaps without moving labels or avoiding node bodies.

Custom node/edge labelRenderers also pass low-zoom and collision checks; sizing policy affects the engine-provided style. Renderers computing their own dimensions from zoom must keep them consistent. Node-label scaling has internal limits and is not indefinitely linear at extreme zoom.

### Scope [#scope]

* Labels need nonempty text; `label: false` or an empty string draws nothing. Business data alone does not create labels.
* Node icons, decorations/badges, and Combo labels use separate rules, unaffected by these five fields.
* Element hidden states, hidden edge endpoints, and viewport culling still affect visibility. Disabling both hiding policies does not guarantee every label appears.

See [node labels](/en/docs/guides/node#labels), [edge labels](/en/docs/guides/edge#edge-labels), or [Combo labels](/en/docs/guides/combo#padding-bounds-and-labels) for content and appearance.

<span id="options-label-runtime-updates" />

## Runtime updates [#runtime-updates]

After the first `await graph.render()`, update appearance and visibility without recreating the instance:

```ts
graph.updateOptions({ node: { style: { labelColor: '#334155' } } });
graph.updateOptions({ edge: { style: { labelColor: '#475569' } } });
graph.updateOptions({ label: { hideOnCollision: false } });
graph.updateOptions({ label: { nodeMinZoom: 0.6 } });
```

The two `label` updates set collision hiding and the node threshold separately. Omitted fields keep their current values, and `label: {}` keeps the current policy. Set a field explicitly to `undefined` to restore its default.

Updates reprocess styles and configured transforms while retaining the current layout and view. Use `updateNodeData()` or `updateEdgeData()` to change business data read by label callbacks. See [configuration updates](/en/docs/api/graph#updateoptions).

## Performance tips [#performance-tips]

* Show important nodes and relationships first in large graphs; business filtering can return false from label callbacks.
* Use global policies for zoom-based hiding. Label callbacks receive element data, not camera zoom; keep them inexpensive.

## Common questions [#common-questions]

### Why is a label missing? [#why-is-a-label-missing]

Check nonempty label, zoom thresholds, collisions, and hidden states on the element or edge endpoints. Business data alone does not generate text. Disabling thresholds does not disable collision hiding.

### Why is a text icon or image missing? [#why-is-a-text-icon-or-image-missing]

Text icons require iconType: 'text' and a loaded font. Check image URLs and anonymous CORS. Node hidden states and viewport bounds still apply.

### Why is long text not truncated? [#why-is-long-text-not-truncated]

labelMaxWidth applies to default node labels and must be positive. Edges do not expose it; custom renderers handle truncation themselves. Default node labels do not wrap automatically.

### Why did the text color not change? [#why-did-the-text-color-not-change]

Use labelColor; labelFill is not supported. Edge stroke, text-icon iconColor, and label colors are configured independently.

<span id="options-label-related-entries" />

## Related [#related]

* [Node labels and icons](/en/docs/guides/node#labels): fields and applicability.
* [Edge labels](/en/docs/guides/edge#edge-labels): placement, rotation, and path limitations.
* [LabelOptions fields and defaults](/en/docs/api/options#options-label)
* [Custom Label Renderer](/en/docs/guides/custom-label-renderer)

**Related runnable examples**

* [Label placement and icons](/en/docs/examples/labels)
* [Label rendering policy](/en/docs/examples/label-rendering-options)
