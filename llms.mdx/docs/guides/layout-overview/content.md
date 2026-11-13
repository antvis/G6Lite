# 布局总览 (/docs/guides/layout-overview)





## 什么是布局 [#什么是布局]

布局决定节点怎么排。比如，流程图可以按步骤从左到右排，关系网可以让联系紧密的节点靠近。如果数据里已经有节点坐标，省略 `layout` 就会沿用 `x` 和 `y`。

## 选择布局 [#选择布局]

| 类型                                                 | 描述                         | 配置示例                                                              |
| -------------------------------------------------- | -------------------------- | ----------------------------------------------------------------- |
| [`grid`](/docs/guides/layout-grid)                 | 排成整齐的行列。                   | `{ type: 'grid', cols: 3 }`                                       |
| [`circular`](/docs/guides/layout-circular)         | 沿圆周排列。                     | `{ type: 'circular', radius: 100 }`                               |
| [`dagre`](/docs/guides/layout-dagre)               | 按流程或依赖关系分层。                | `{ type: 'dagre', rankdir: 'LR', ranksep: 80 }`                   |
| [`force`](/docs/guides/layout-force)               | 让相连节点靠近，同时拉开节点间距。          | `{ type: 'force', linkDistance: 100 }`                            |
| [`d3-force`](/docs/guides/layout-d3-force)         | 用 D3 力模拟排列关系网络。            | `{ type: 'd3-force', linkDistance: 100 }`                         |
| [`force-atlas2`](/docs/guides/layout-force-atlas2) | 用力模拟呈现网络中的群组。              | `{ type: 'force-atlas2', kr: 8, kg: 2 }`                          |
| [`fruchterman`](/docs/guides/layout-fruchterman)   | 用引力和斥力分布节点。                | `{ type: 'fruchterman', gravity: 12 }`                            |
| [`radial`](/docs/guides/layout-radial)             | **可选。** 围绕指定节点，按图上的距离分圈。   | `{ type: 'radial', focusNode: '0', unitRadius: 68 }`              |
| [`concentric`](/docs/guides/layout-concentric)     | 按节点度数排成同心圆。                | `{ type: 'concentric', sortBy: 'degree' }`                        |
| [`mds`](/docs/guides/layout-mds)                   | **可选。** 用平面上的距离表现节点在图中的远近。 | `{ type: 'mds', linkDistance: 80 }`                               |
| [`indented`](/docs/guides/layout-indented)         | **可选。** 把树排成逐层缩进的目录。       | `{ type: 'indented', indent: 80, rowHeight: 40 }`                 |
| [`mindmap`](/docs/guides/layout-mindmap)           | **可选。** 把树排成脑图分支。          | `{ type: 'mindmap', levelGap: 120, nodeGap: 30 }`                 |
| [`fishbone`](/docs/guides/layout-fishbone)         | **可选。** 沿鱼骨主干展示分类和条目。      | `{ type: 'fishbone', categoryGap: 180 }`                          |
| [`random`](/docs/guides/layout-random)             | **可选。** 在指定范围内随机放置节点。      | `{ type: 'random', width: 800, height: 600, center: [400, 300] }` |

表中的配置对象写在 `layout` 中。更多参数和效果见[布局通用配置项](/docs/guides/layout)。

## 可选布局 [#optional-layouts]

缩进树、思维导图、鱼骨图、放射布局、MDS 和随机布局需要先注册。npm 项目可以从各自的子路径导入，之后照常通过 `layout.type` 指定。

```ts
import { register } from '@antv/g6-lite';
import radial from '@antv/g6-lite/layouts/radial';

register('layout', 'radial', radial);

const layout = { type: 'radial', focusNode: '0', unitRadius: 68 };
```

通过 CDN 使用 UMD 时，在主脚本之后加载同版本的 `dist/g6-lite-layouts.min.js`，再从 `G6LiteLayouts` 取出要注册的布局。

```html
<script src="https://cdn.jsdelivr.net/npm/@antv/g6-lite@0.1.0/dist/g6-lite.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@antv/g6-lite@0.1.0/dist/g6-lite-layouts.min.js"></script>
<script>
  G6Lite.register('layout', 'radial', G6LiteLayouts.radial);
</script>
```

注册的布局在主线程运行。

## 配置与示例 [#配置与示例]

布局类型通过 `layout.type` 指定。下面用 Dagre 把三个步骤从左到右排列。

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: '#container',
  data: {
    nodes: [{ id: '提交' }, { id: '审核' }, { id: '发布' }],
    edges: [
      { source: '提交', target: '审核' },
      { source: '审核', target: '发布' },
    ],
  },
  layout: { type: 'dagre', rankdir: 'LR', ranksep: 80 },
  node: { style: { label: (node) => node.id } },
});

await graph.render();
```

切换下图的 **Layout**，可以比较同一份数据在网格、环形和 Dagre 布局中的效果。力导向布局见[关系网络布局](/docs/guides/layout-networks)。



```ts
const layouts: Record<string, LayoutConfig> = {
  grid: { type: 'grid', rows: 2, cols: 3, width: 360, height: 160 },
  circular: { type: 'circular', radius: 100 },
  dagre: { type: 'dagre', rankdir: 'LR', nodesep: 64, ranksep: 96, nodeSize: 28 },
};
```

**完整运行代码**

```ts
import { Graph, type LayoutConfig } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  // #region layout-options
  const layouts: Record<string, LayoutConfig> = {
    grid: { type: 'grid', rows: 2, cols: 3, width: 360, height: 160 },
    circular: { type: 'circular', radius: 100 },
    dagre: { type: 'dagre', rankdir: 'LR', nodesep: 64, ranksep: 96, nodeSize: 28 },
  };
  // #endregion layout-options
  const graph = new Graph({
    container,
    data: {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F'].map((id) => ({ id })),
      edges: [
        { source: 'A', target: 'B' }, { source: 'A', target: 'C' },
        { source: 'B', target: 'D' }, { source: 'C', target: 'E' },
        { source: 'D', target: 'F' }, { source: 'E', target: 'F' },
      ],
    },
    layout: layouts.grid,
    node: { style: { size: 28, label: (node) => node.id, labelOffsetY: 8 } },
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  let generation = 0;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { generation++; ui.destroy(); destroy(); };
  try {
    await graph.render();
    ui.setStatus('grid ready');
    ui.addChoice('Layout', Object.keys(layouts), 'grid', async (value) => {
      const current = ++generation;
      ui.setStatus('Running…');
      graph.setLayout(layouts[value]);
      try {
        await graph.layout();
        if (current !== generation || graph.destroyed) return;
        graph.fitView({ padding: 56, maxZoom: 1 });
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



参数和运行时更新方式见[布局通用配置项](/docs/guides/layout)。需要自己计算坐标时，见[自定义布局](/docs/guides/custom-layout)。
