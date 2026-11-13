# 放射布局 Radial (/docs/guides/layout-radial)





## 概述 [#概述]

节点按到中心节点的最短路径距离分圈。

## 使用场景 [#使用场景]

适合查看某个账号、服务或设备的直接和间接关系。

## 基本用法 [#基本用法]

这是可选布局。先导入并注册，再设置 `layout.type`。CDN 接入见[可选布局](/docs/guides/layout-overview#optional-layouts)。

```ts
import { Graph, register } from '@antv/g6-lite';
import radial from '@antv/g6-lite/layouts/radial';

register('layout', 'radial', radial);

const graph = new Graph({
  container,
  data,
  layout: { type: 'radial' },
});
```

## 配置项 [#配置项]

| 参数               | 描述              | 类型        | 默认值     |
| ---------------- | --------------- | --------- | ------- |
| `focusNode`      | 中心节点的 ID。       | `string`  | 第一个节点   |
| `unitRadius`     | 相邻两圈之间的距离。      | `number`  | 自动计算    |
| `linkDistance`   | 布局计算中的参考边长。     | `number`  | `50`    |
| `preventOverlap` | 是否尝试避免同一圈的节点重叠。 | `boolean` | `false` |

[布局通用配置项](/docs/guides/layout) · [布局参数参考](/docs/api/options#config-library-layout-fields)

## 代码示例 [#代码示例]

紫色节点 `0` 位于中心，相邻两圈相距 68。



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

import radial from '@antv/g6-lite/layouts/radial';

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
  register('layout', 'radial', radial);
  const layout: LayoutConfig = { type: 'radial', focusNode: '0', unitRadius: 68 };
  return render(container, layout, network(layout.type));
}
```



[对比关系网络布局](/docs/guides/layout-networks)
