# 层级布局 Dagre (/docs/guides/layout-dagre)





## 概述 [#概述]

节点按有向边的关系分层排列。

## 使用场景 [#使用场景]

适合流程图、调用链和依赖图。

## 基本用法 [#基本用法]

布局类型通过 `layout.type` 指定。

```ts
const graph = new Graph({
  container,
  data,
  layout: { type: 'dagre' },
});
```

## 配置项 [#配置项]

| 参数         | 描述                            | 类型                                   | 默认值      |
| ---------- | ----------------------------- | ------------------------------------ | -------- |
| `rankdir`  | 分层方向。`'LR'` 从左到右，`'TB'` 从上到下。 | `'TB'` \| `'BT'` \| `'LR'` \| `'RL'` | `'TB'`   |
| `nodesep`  | 同一层中节点之间的间距。                  | `number`                             | `50`     |
| `ranksep`  | 层与层之间的间距。                     | `number`                             | `50`     |
| `nodeSize` | 参与计算的节点宽高。                    | `number` \| `[number, number]`       | `[0, 0]` |

[布局通用配置项](/docs/guides/layout) · [布局参数参考](/docs/api/options#config-library-layout-fields)

## 代码示例 [#代码示例]

流程从左到右，审核和检查在同一层。



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

type ExampleOptions = Pick<GraphOptions, 'data' | 'node' | 'edge'>;

function arrangement(type: string): ExampleOptions {
  if (type === 'dagre') {
    return {
      data: {
        nodes: ['Input', 'Review', 'Check', 'Publish'].map((id) => ({ id })),
        edges: [
          { source: 'Input', target: 'Review' },
          { source: 'Input', target: 'Check' },
          { source: 'Review', target: 'Publish' },
          { source: 'Check', target: 'Publish' },
        ],
      },
      node: {
        type: 'rect',
        style: {
          width: 80, height: 32, borderRadius: 6,
          label: (node) => node.id, labelColor: '#fff', labelPlacement: 'center',
        },
      },
      edge: { type: 'polyline', style: { router: 'orth', radius: 12, endArrow: true } },
    };
  }

  const ids = Array.from({ length: type === 'grid' ? 6 : 8 }, (_, i) => String.fromCharCode(65 + i));
  return {
    data: {
      nodes: ids.map((id) => ({ id })),
      edges: type === 'grid' ? [] : ids.map((source, i) => ({ source, target: ids[(i + 2) % ids.length] })),
    },
    node: { style: { size: 24, label: (node) => node.id, labelColor: '#fff', labelPlacement: 'center' } },
  };
}

async function render(container: HTMLElement, layout: LayoutConfig, options: ExampleOptions) {
  const graph = new Graph({
    container,
    ...options,
    layout,
    behaviors: ['drag-canvas', 'zoom-canvas'],
    autoFit: { padding: 36, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}

export function run(container: HTMLElement) {
  const layout: LayoutConfig = { type: 'dagre', rankdir: 'LR', nodesep: 32, ranksep: 80, nodeSize: [80, 32] };
  return render(container, layout, arrangement(layout.type));
}
```



[对比网格、环形与层级布局](/docs/guides/layout-arrangements)
