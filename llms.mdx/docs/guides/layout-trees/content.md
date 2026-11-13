# 树布局 (/docs/guides/layout-trees)





## 选择布局 [#选择布局]

树的父子关系用边表示。`source` 填父节点，`target` 填子节点。使用一棵连通、无环且只有一个根的树。

| 想呈现什么       | 布局与常用参数                                                                     |
| ----------- | --------------------------------------------------------------------------- |
| 脑图分支        | [`mindmap`](/docs/guides/layout-mindmap)，层级间距用 `levelGap`，同侧节点间距用 `nodeGap` |
| 文件目录        | [`indented`](/docs/guides/layout-indented)，缩进量用 `indent`，行距用 `rowHeight`    |
| 根、分类、条目三层结构 | [`fishbone`](/docs/guides/layout-fishbone)，主干上的分类间距用 `categoryGap`          |

## 配置与示例 [#配置与示例]

用 **Tree layout** 切换三种布局。示例同时调整边的画法，缩进树用折线连接，鱼骨图用斜线展示条目。

这三种树布局都需要先注册。 [可选布局](/docs/guides/layout-overview#optional-layouts)



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

**完整运行代码**

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



默认值和字段说明见[树布局参考](/docs/api/options#config-tree-layout-fields)。
