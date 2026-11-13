# 多维尺度布局 MDS (/docs/guides/layout-mds)





## 概述 [#概述]

多维尺度分析（MDS）用平面距离近似表示图中节点的最短路径距离。

## 使用场景 [#使用场景]

适合观察网络中节点的相对远近。

## 基本用法 [#基本用法]

这是可选布局。先导入并注册，再设置 `layout.type`。CDN 接入见[可选布局](/docs/guides/layout-overview#optional-layouts)。

```ts
import { Graph, register } from '@antv/g6-lite';
import mds from '@antv/g6-lite/layouts/mds';

register('layout', 'mds', mds);

const graph = new Graph({
  container,
  data,
  layout: { type: 'mds' },
});
```

## 配置项 [#配置项]

| 参数             | 描述            | 类型                 | 默认值     |
| -------------- | ------------- | ------------------ | ------- |
| `linkDistance` | 用于缩放图距离的参考长度。 | `number`           | `50`    |
| `center`       | 布局中心的图坐标。     | `[number, number]` | 布局范围的中心 |

[布局通用配置项](/docs/guides/layout) · [布局参数参考](/docs/api/options#config-library-layout-fields)

## 代码示例 [#代码示例]

示例用 80 作为距离尺度，图上相距较远的节点通常也会排得更远。



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

import mds from '@antv/g6-lite/layouts/mds';

type ExampleOptions = Pick<GraphOptions, 'data' | 'node' | 'edge'>;

function network(type: string): ExampleOptions {
  const links = [
    [0, 1], [0, 2], [0, 3], [1, 2], [1, 4], [1, 5],
    [2, 5], [2, 6], [3, 7], [3, 8], [3, 9],
    [7, 8], [8, 9], [4, 10], [4, 11], [10, 11],
  ];
  return {
    data: {
      nodes: Array.from({ length: 12 }, (_, index) => ({ id: String(index) })),
      edges: links.map(([source, target]) => ({ source: String(source), target: String(target) })),
    },
    node: {
      style: {
        size: 24,
        label: (node) => node.id,
        labelColor: '#fff',
        labelPlacement: 'center',
        fill: (node) => type === 'radial' && node.id === '0' ? '#6d28d9' : '#1677ff',
      },
    },
    edge: { style: { lineWidth: 2 } },
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
  register('layout', 'mds', mds);
  const layout: LayoutConfig = { type: 'mds', linkDistance: 80 };
  return render(container, layout, network(layout.type));
}
```



[对比关系网络布局](/docs/guides/layout-networks)
