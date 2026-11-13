# 思维导图布局 Mindmap (/docs/guides/layout-mindmap)





## 概述 [#概述]

分支从中心主题向一侧或两侧展开。

## 使用场景 [#使用场景]

适合梳理主题、知识点和分类层级。

## 基本用法 [#基本用法]

这是可选布局。先导入并注册，再设置 `layout.type`。CDN 接入见[可选布局](/docs/guides/layout-overview#optional-layouts)。

```ts
import { Graph, register } from '@antv/g6-lite';
import mindmap from '@antv/g6-lite/layouts/mindmap';

register('layout', 'mindmap', mindmap);

const graph = new Graph({
  container,
  data,
  layout: { type: 'mindmap' },
});
```

## 配置项 [#配置项]

| 参数          | 描述                                           | 类型                          | 默认值          |
| ----------- | -------------------------------------------- | --------------------------- | ------------ |
| `direction` | `'LR'` 向右，`'RL'` 向左，`'H'` 通过 `getSide` 分配分支。 | `'H'` \| `'LR'` \| `'RL'`   | `'H'`        |
| `getSide`   | 指定分支在左侧还是右侧。函数可读取节点、分支索引和父节点所在侧。             | 返回 `'left'` 或 `'right'` 的函数 | 返回 `'right'` |
| `levelGap`  | 父子节点之间的水平留白。                                 | `number`                    | `120`        |
| `nodeGap`   | 同侧相邻子节点之间的垂直留白。                              | `number`                    | `30`         |

[布局通用配置项](/docs/guides/layout) · [布局参数参考](/docs/api/options#config-tree-layout-fields)

## 代码示例 [#代码示例]

父子关系通过边定义，`source` 填父节点的 ID，`target` 填子节点的 ID。

`getSide` 将 A、C 分支排在左侧，B、D 分支排在右侧。



```ts
import { Graph, register, type GraphNode, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

import mindmap from '@antv/g6-lite/layouts/mindmap';

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
  register('layout', 'mindmap', mindmap);
  const layout: LayoutConfig = {
    type: 'mindmap',
    direction: 'H',
    levelGap: 100,
    nodeGap: 24,
    getWidth: () => 16,
    getHeight: (node: GraphNode) => node.id.length === 1 ? 64 : 16,
    getSide: (node: GraphNode) => /^[AC]/.test(node.id) ? 'left' : 'right',
  };
  return render(container, layout, tree(layout.type));
}
```



[对比树布局](/docs/guides/layout-trees)
