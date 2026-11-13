# 网格布局 Grid (/docs/guides/layout-grid)





## 概述 [#概述]

节点按行列排成网格。

## 使用场景 [#使用场景]

适合设备面板、资源列表等需要整齐对齐的图。

## 基本用法 [#基本用法]

布局类型通过 `layout.type` 指定。

```ts
const graph = new Graph({
  container,
  data,
  layout: { type: 'grid' },
});
```

## 配置项 [#配置项]

| 参数               | 描述                                   | 类型                           | 默认值        |
| ---------------- | ------------------------------------ | ---------------------------- | ---------- |
| `rows`           | 行数。                                  | `number`                     | 自动计算       |
| `cols`           | 列数。                                  | `number`                     | 自动计算       |
| `width`、`height` | 网格的计算宽度和高度。                          | `number`                     | 画布宽高       |
| `sortBy`         | `'id'` 按节点 ID 排列，`'degree'` 按节点度数排列。 | `'id'` \| `'degree'` \| 排序函数 | `'degree'` |

[布局通用配置项](/docs/guides/layout) · [布局参数参考](/docs/api/options#config-library-layout-fields)

## 代码示例 [#代码示例]

六个节点排成两行三列。



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
  const layout: LayoutConfig = { type: 'grid', rows: 2, cols: 3, width: 360, height: 160 };
  return render(container, layout, arrangement(layout.type));
}
```



[对比网格、环形与层级布局](/docs/guides/layout-arrangements)
