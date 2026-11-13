# 鱼骨布局 Fishbone (/docs/guides/layout-fishbone)





## 概述 [#概述]

问题放在主干末端。每个原因分类用一根斜线接入主干，具体原因用水平短线接到所属分类。

## 使用场景 [#使用场景]

适合「问题 → 原因分类 → 具体原因」这类三层结构。

## 基本用法 [#基本用法]

这是可选布局。先导入并注册，再设置 `layout.type`。CDN 接入见[可选布局](/docs/guides/layout-overview#optional-layouts)。

```ts
import { Graph, register } from '@antv/g6-lite';
import fishbone from '@antv/g6-lite/layouts/fishbone';

register('layout', 'fishbone', fishbone);

const graph = new Graph({
  container,
  data,
  layout: { type: 'fishbone' },
  edge: { type: 'polyline', style: { router: 'fishbone', endArrow: false } },
});
```

## 配置项 [#配置项]

| 参数                 | 描述                       | 类型               | 默认值     |
| ------------------ | ------------------------ | ---------------- | ------- |
| `categoryGap`      | 相邻分类沿主干方向的间距。            | `number`         | `180`   |
| `categoryDistance` | 分类节点与主干之间的垂直距离。          | `number`         | `200`   |
| `itemHStep`        | 条目节点的额外水平偏移。             | `number`         | `20`    |
| `getWidth`         | 布局使用的节点宽度，建议与绘制宽度一致。     | 返回宽度的函数          | 返回 `80` |
| `direction`        | `'RL'` 将 `'LR'` 的排列水平翻转。 | `'LR'` \| `'RL'` | `'LR'`  |

[布局通用配置项](/docs/guides/layout) · [布局参数参考](/docs/api/options#config-tree-layout-fields)

## 代码示例 [#代码示例]

父子关系通过边定义，`source` 填父节点的 ID，`target` 填子节点的 ID。

下图分析发布延期的原因。人员、工具、流程和范围是四个原因分类，每个分类下有两项具体原因。



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

import fishboneLayout from '@antv/g6-lite/layouts/fishbone';

type ExampleOptions = Pick<GraphOptions, 'data' | 'node' | 'edge'>;

function fishbone(): ExampleOptions {
  const head = 'Late release';
  const causes = [
    { category: 'People', items: ['Staff shortage', 'Late handoff'] },
    { category: 'Tools', items: ['Slow build', 'Test outages'] },
    { category: 'Process', items: ['Review queue', 'Manual checks'] },
    { category: 'Scope', items: ['New requests', 'Rework'] },
  ];
  const edges = causes.flatMap(({ category, items }) => [
    { source: head, target: category },
    ...items.map((item) => ({ source: category, target: item })),
  ]);
  const categories = new Set(causes.map(({ category }) => category));
  // #region edge-router
  const edge = {
    type: 'polyline',
    style: { router: 'fishbone', endArrow: false, stroke: '#7086a8', lineWidth: 2 },
  } as const;
  // #endregion edge-router
  return {
    data: { nodes: [{ id: head }, ...edges.map(({ target }) => ({ id: target }))], edges },
    node: {
      type: 'rect',
      style: {
        width: 96,
        height: (node) => node.id === head || categories.has(node.id) ? 30 : 22,
        borderRadius: 5,
        fill: (node) => node.id === head ? '#3730a3' : categories.has(node.id) ? '#1d4ed8' : '#eff6ff',
        label: (node) => node.id,
        labelPlacement: 'center',
        labelColor: (node) => node.id === head || categories.has(node.id) ? '#fff' : '#1e3a5f',
      },
    },
    edge,
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
  register('layout', 'fishbone', fishboneLayout);
  const layout: LayoutConfig = {
    type: 'fishbone',
    direction: 'LR',
    categoryGap: 200,
    categoryDistance: 138,
    itemHStep: 26,
    getWidth: () => 96,
  };
  return render(container, layout, fishbone());
}
```



[对比树布局](/docs/guides/layout-trees)
