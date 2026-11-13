# Tree layouts (/en/docs/guides/layout-trees)





## Choose a layout [#choose-a-layout]

Express parent-child relationships as edges with the parent as `source` and the child as `target`. Use one connected tree with a single root and no cycles.

| Goal                        | Layout and common options                                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Mind map branches           | [`mindmap`](/en/docs/guides/layout-mindmap), with `levelGap` between levels and `nodeGap` between neighbors on the same side |
| Directory listing           | [`indented`](/en/docs/guides/layout-indented), with `indent` for indentation and `rowHeight` for row spacing                 |
| Root, categories, and items | [`fishbone`](/en/docs/guides/layout-fishbone), with `categoryGap` between categories along the spine                         |

## Configuration and example [#configuration-and-example]

Use **Tree layout** to compare the three arrangements. The example also changes the edge routing. Indented trees use elbow connectors, while the fishbone layout uses angled branches.

Register each tree layout before using it. [Optional layouts](/en/docs/guides/layout-overview#optional-layouts)



```ts
const layouts = {
  mindmap: {
    layout: {
      type: 'mindmap',
      direction: 'H',
      levelGap: 100,
      nodeGap: 24,
      getWidth: () => nodeSize,
      getHeight: (node: GraphNode) => node.id.length === 1 ? 64 : nodeSize,
      getSide: (node: GraphNode) => leftBranches.has(node.id[0]) ? 'left' : 'right',
    },
    edge: { type: 'line', style: { endArrow: false } },
  },
  indented: {
    layout: { type: 'indented', direction: 'LR', indent: 72, rowHeight: 30 },
    edge: { type: 'polyline', style: { router: 'indented', endArrow: false } },
  },
  fishbone: {
    layout: {
      type: 'fishbone',
      direction: 'LR',
      categoryGap: 156,
      categoryDistance: 130,
      itemHStep: 54,
      getWidth: () => nodeSize,
    },
    edge: { type: 'polyline', style: { router: 'fishbone', endArrow: false } },
  },
} satisfies Record<string, { layout: LayoutConfig; edge: EdgeConfig }>;
```

**Complete runnable code**

```ts
import { Graph, register, type EdgeConfig, type GraphNode, type LayoutConfig } from '@antv/g6-lite';
import indented from '@antv/g6-lite/layouts/indented';
import mindmap from '@antv/g6-lite/layouts/mindmap';
import fishbone from '@antv/g6-lite/layouts/fishbone';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  register('layout', 'indented', indented);
  register('layout', 'mindmap', mindmap);
  register('layout', 'fishbone', fishbone);
  const nodeSize = 16;
  const leftBranches = new Set(['A', 'C']);
  // #region tree-layouts
  const layouts = {
    mindmap: {
      layout: {
        type: 'mindmap',
        direction: 'H',
        levelGap: 100,
        nodeGap: 24,
        getWidth: () => nodeSize,
        getHeight: (node: GraphNode) => node.id.length === 1 ? 64 : nodeSize,
        getSide: (node: GraphNode) => leftBranches.has(node.id[0]) ? 'left' : 'right',
      },
      edge: { type: 'line', style: { endArrow: false } },
    },
    indented: {
      layout: { type: 'indented', direction: 'LR', indent: 72, rowHeight: 30 },
      edge: { type: 'polyline', style: { router: 'indented', endArrow: false } },
    },
    fishbone: {
      layout: {
        type: 'fishbone',
        direction: 'LR',
        categoryGap: 156,
        categoryDistance: 130,
        itemHStep: 54,
        getWidth: () => nodeSize,
      },
      edge: { type: 'polyline', style: { router: 'fishbone', endArrow: false } },
    },
  } satisfies Record<string, { layout: LayoutConfig; edge: EdgeConfig }>;
  // #endregion tree-layouts
  const edges = ['A', 'B', 'C', 'D'].flatMap((branch) => [
    { source: 'Root', target: branch },
    { source: branch, target: `${branch}1` },
    { source: branch, target: `${branch}2` },
  ]);
  const edgeStyle = {
    stroke: '#8a9db7',
    lineWidth: 1.5,
  };
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'Root' }, ...edges.map(({ target }) => ({ id: target }))],
      edges,
    },
    layout: layouts.mindmap.layout,
    edge: { ...layouts.mindmap.edge, style: { ...edgeStyle, ...layouts.mindmap.edge.style } },
    node: {
      style: {
        size: nodeSize,
        fill: (node) => node.id === 'Root' ? '#9860cf' : '#4c78db',
        label: (node) => node.id,
        labelOffsetY: 4,
      },
    },
    label: { hideOnLowZoom: false },
    behaviors: [],
    autoFit: { padding: 48, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  let generation = 0;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { generation++; ui.destroy(); destroy(); };
  try {
    await graph.render();
    ui.setStatus('mindmap ready');
    ui.addChoice('Tree layout', ['mindmap', 'indented', 'fishbone'] as const, 'mindmap', async (value) => {
      const current = ++generation;
      try {
        const { layout, edge } = layouts[value];
        graph.setLayout(layout);
        graph.updateOptions({
          edge,
          node: { style: { labelPlacement: value === 'indented' ? 'right' : 'bottom' } },
        });
        // Rebuild the render data so the router receives the new layout direction.
        await graph.render();
        if (current !== generation || graph.destroyed) return;
        ui.setStatus(`${value} ready`);
      } catch {
        if (current === generation && !graph.destroyed) ui.setStatus('Layout failed');
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



See the [tree layout reference](/en/docs/api/options#config-tree-layout-fields) for defaults and other options.
