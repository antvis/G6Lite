# 关系网络布局 (/docs/guides/layout-networks)





## 选择布局 [#选择布局]

| 想看到什么            | 布局                                                                                                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 让相连的节点靠近         | [`force`](/docs/guides/layout-force)、[`d3-force`](/docs/guides/layout-d3-force)、[`force-atlas2`](/docs/guides/layout-force-atlas2)、[`fruchterman`](/docs/guides/layout-fruchterman) |
| 看某个节点周围的关系       | [`radial`](/docs/guides/layout-radial)，通过 `focusNode` 选择中心节点                                                                                                                        |
| 按节点度数分圈          | [`concentric`](/docs/guides/layout-concentric)，通过 `sortBy: 'degree'` 按度数分层                                                                                                          |
| 用平面上的距离表现图中节点的远近 | [`mds`](/docs/guides/layout-mds)，通过 `linkDistance` 调整距离尺度                                                                                                                           |

## 配置与示例 [#配置与示例]

示例默认使用放射布局。中心节点通过 `focusNode` 设为 `0`，圈间距通过 `unitRadius` 设为 68。用 **Layout** 切换布局，对比同一张关系图的排布。

放射布局和 MDS 需要先注册。 [可选布局](/docs/guides/layout-overview#optional-layouts)



```ts
const layouts: Record<string, LayoutConfig> = {
  radial: { type: 'radial', focusNode: '0', unitRadius: 68 },
  concentric: { type: 'concentric', sortBy: 'degree', nodeSize: 24 },
  force: { type: 'force', linkDistance: 100 },
  'd3-force': { type: 'd3-force', linkDistance: 100 },
  'force-atlas2': { type: 'force-atlas2', kr: 8, kg: 2 },
  fruchterman: { type: 'fruchterman', gravity: 12 },
  mds: { type: 'mds', linkDistance: 80 },
};
```

**完整运行代码**

```ts
import { Graph, register, type LayoutConfig } from '@antv/g6-lite';
import mds from '@antv/g6-lite/layouts/mds';
import radial from '@antv/g6-lite/layouts/radial';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  register('layout', 'mds', mds);
  register('layout', 'radial', radial);
  // #region network-options
  const layouts: Record<string, LayoutConfig> = {
    radial: { type: 'radial', focusNode: '0', unitRadius: 68 },
    concentric: { type: 'concentric', sortBy: 'degree', nodeSize: 24 },
    force: { type: 'force', linkDistance: 100 },
    'd3-force': { type: 'd3-force', linkDistance: 100 },
    'force-atlas2': { type: 'force-atlas2', kr: 8, kg: 2 },
    fruchterman: { type: 'fruchterman', gravity: 12 },
    mds: { type: 'mds', linkDistance: 80 },
  };
  // #endregion network-options
  const connections = [
    ['0', '1'], ['0', '2'], ['0', '3'], ['1', '2'], ['1', '4'], ['1', '5'],
    ['2', '5'], ['2', '6'], ['3', '7'], ['3', '8'], ['3', '9'],
    ['7', '8'], ['8', '9'], ['4', '10'], ['4', '11'], ['10', '11'],
  ];
  const graph = new Graph({
    container,
    data: {
      nodes: Array.from({ length: 12 }, (_, index) => ({ id: String(index) })),
      edges: connections.map(([source, target]) => ({ source, target })),
    },
    layout: layouts.radial,
    node: {
      style: {
        size: 24,
        label: (node) => node.id,
        labelPlacement: 'center',
        labelColor: '#fff',
        fill: (node) => node.id === '0' ? '#6d28d9' : '#1677ff',
      },
    },
    edge: { style: { lineWidth: 2 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 48, maxZoom: 1 },
  });
  const panel = createDemoPanel(container);
  let revision = 0;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    revision++;
    panel.destroy();
    destroy();
  };

  try {
    await graph.render();
    panel.setStatus('radial ready');
    panel.addChoice('Layout', Object.keys(layouts), 'radial', async (type) => {
      const current = ++revision;
      panel.setStatus('Running…');
      graph.setLayout(layouts[type]);
      try {
        await graph.layout();
        if (current !== revision || graph.destroyed) return;
        graph.fitView({ padding: 48, maxZoom: 1 });
        panel.setStatus(`${type} ready`);
      } catch {
        if (current === revision && !graph.destroyed) panel.setStatus('Layout failed');
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



力导向布局的常用参数见[布局配置参考](/docs/api/options#config-library-layout-fields)，后台计算见[Worker 布局指南](/docs/guides/layout-worker)。其他效果见[布局示例合集](/docs/examples/layout-gallery)。
