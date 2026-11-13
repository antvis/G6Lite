# 随机布局 Random (/docs/guides/layout-random)





## 概述 [#概述]

节点随机散布在布局中心附近。

## 使用场景 [#使用场景]

适合快速预览图数据。每次重新计算都会随机生成坐标。

## 基本用法 [#基本用法]

这是可选布局。先导入并注册，再设置 `layout.type`。CDN 接入见[可选布局](/docs/guides/layout-overview#optional-layouts)。

```ts
import { Graph, register } from '@antv/g6-lite';
import random from '@antv/g6-lite/layouts/random';

register('layout', 'random', random);

const graph = new Graph({
  container,
  data,
  layout: { type: 'random' },
});
```

## 配置项 [#配置项]

| 参数       | 描述        | 类型                 | 默认值     |
| -------- | --------- | ------------------ | ------- |
| `width`  | 控制水平散布范围。 | `number`           | 画布宽度    |
| `height` | 控制垂直散布范围。 | `number`           | 画布高度    |
| `center` | 散布中心的图坐标。 | `[number, number]` | 布局范围的中心 |

[布局通用配置项](/docs/guides/layout) · [布局参数参考](/docs/api/options#config-library-layout-fields)

## 代码示例 [#代码示例]

节点散布在 `[200, 120]` 附近。点击重置可重新生成位置。



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

import random from '@antv/g6-lite/layouts/random';

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
  register('layout', 'random', random);
  const layout: LayoutConfig = { type: 'random', width: 400, height: 240, center: [200, 120] };
  return render(container, layout, arrangement(layout.type));
}
```



[查看布局示例合集](/docs/examples/layout-gallery)
