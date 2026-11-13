# 环形布局 Circular (/docs/guides/layout-circular)





## 概述 [#概述]

节点沿圆周排列，半径也可以逐个变化，形成螺旋。

## 使用场景 [#使用场景]

适合没有明确层级的关系图，也可用螺旋展示有先后顺序的节点。

## 基本用法 [#基本用法]

布局类型通过 `layout.type` 指定。

```ts
const graph = new Graph({
  container,
  data,
  layout: { type: 'circular' },
});
```

## 配置项 [#配置项]

| 参数                        | 描述                       | 类型                                                  | 默认值        |
| ------------------------- | ------------------------ | --------------------------------------------------- | ---------- |
| `radius`                  | 固定圆环半径。只设置起止半径时，节点可排成螺旋。 | `number`                                            | 布局宽高中较短的一半 |
| `startRadius`、`endRadius` | 螺旋的起止半径，省略 `radius` 时使用。 | `number`                                            | —          |
| `clockwise`               | 是否按顺时针排列。                | `boolean`                                           | `true`     |
| `ordering`                | 节点顺序，可按拓扑、带方向的拓扑或度数排序。   | `'topology'` \| `'topology-directed'` \| `'degree'` | 数据顺序       |

[布局通用配置项](/docs/guides/layout) · [布局参数参考](/docs/api/options#config-library-layout-fields)

## 代码示例 [#代码示例]

八个节点沿半径为 100 的圆周排列。



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
  const layout: LayoutConfig = { type: 'circular', radius: 100 };
  return render(container, layout, arrangement(layout.type));
}
```



### 螺旋排列 [#螺旋排列]

起止半径分别通过 `startRadius` 和 `endRadius` 设置，`radius` 省略。

```ts
const layout = { type: 'circular', startRadius: 30, endRadius: 140 };
```

[对比网格、环形与层级布局](/docs/guides/layout-arrangements)
