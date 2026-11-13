# 缩进树布局 Indented (/docs/guides/layout-indented)





## 概述 [#概述]

节点按树的遍历顺序逐行排列，子节点随层级加深而缩进。

## 使用场景 [#使用场景]

适合文件目录、导航菜单和分类列表。

## 基本用法 [#基本用法]

这是可选布局。先导入并注册，再设置 `layout.type`。CDN 接入见[可选布局](/docs/guides/layout-overview#optional-layouts)。

```ts
import { Graph, register } from '@antv/g6-lite';
import indented from '@antv/g6-lite/layouts/indented';

register('layout', 'indented', indented);

const graph = new Graph({
  container,
  data,
  layout: { type: 'indented' },
});
```

## 配置项 [#配置项]

| 参数          | 描述                       | 类型               | 默认值    |
| ----------- | ------------------------ | ---------------- | ------ |
| `indent`    | 每深入一层的水平缩进。              | `number`         | `80`   |
| `rowHeight` | 相邻两行之间的垂直距离。             | `number`         | `40`   |
| `direction` | `'LR'` 向右缩进，`'RL'` 向左缩进。 | `'LR'` \| `'RL'` | `'LR'` |
| `rootId`    | 根节点的 ID。                 | `string`         | 首个无父节点 |

[布局通用配置项](/docs/guides/layout) · [布局参数参考](/docs/api/options#config-tree-layout-fields)

## 代码示例 [#代码示例]

父子关系通过边定义，`source` 填父节点的 ID，`target` 填子节点的 ID。

子节点在下一层缩进 72，边通过 `router: 'indented'` 按目录树的方式连接。



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

import indented from '@antv/g6-lite/layouts/indented';

type ExampleOptions = Pick<GraphOptions, 'data' | 'node' | 'edge'>;

function tree(type: string): ExampleOptions {
  const edges = ['A', 'B', 'C', 'D'].flatMap((branch) => [
    { source: 'Root', target: branch },
    { source: branch, target: `${branch}1` },
    { source: branch, target: `${branch}2` },
  ]);
  return {
    data: {
      nodes: [{ id: 'Root' }, ...edges.map(({ target }) => ({ id: target }))],
      edges,
    },
    node: {
      style: {
        size: 16,
        label: (node) => node.id,
        labelPlacement: type === 'indented' ? 'right' : 'bottom',
      },
    },
    edge: type === 'indented'
      ? { type: 'polyline', style: { router: type, endArrow: false } }
      : { style: { endArrow: false } },
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
  register('layout', 'indented', indented);
  const layout: LayoutConfig = { type: 'indented', direction: 'LR', indent: 72, rowHeight: 30 };
  return render(container, layout, tree(layout.type));
}
```



[对比树布局](/docs/guides/layout-trees)
