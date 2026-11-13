# 辐射树 (/docs/examples/radial-tree)





用辐射布局把一棵主题树铺在中心节点周围。

## 如何体验

缩放查看中心主题和周围分支。

## 数据说明

一棵 10 个节点的主题树围绕根节点排列。

## 完整运行代码

```ts
/**
 * Demo: a topic tree laid out with the radial algorithm.
 */
import { Graph, register } from '@antv/g6-lite';
import radial from '@antv/g6-lite/layouts/radial';

const TREE: Array<[string, string, string?]> = [
  ['root', '产品'],
  ['research', '研究', 'root'],
  ['design', '设计', 'root'],
  ['build', '研发', 'root'],
  ['interview', '访谈', 'research'],
  ['metrics', '指标', 'research'],
  ['flow', '流程', 'design'],
  ['visual', '视觉', 'design'],
  ['api', '接口', 'build'],
  ['test', '测试', 'build'],
];

export async function run(container: string | HTMLElement) {
  register('layout', 'radial', radial);
  const graph = new Graph({
    autoFit: { padding: 32 },
    container,
    data: {
      nodes: TREE.map(([id, label]) => ({ id, data: { label, root: id === 'root' } })),
      edges: TREE.filter((item) => item[2]).map(([id, , parent]) => ({ source: parent!, target: id })),
    },
    node: {
      style: {
        size: (node) => (node.data?.root ? 46 : 28),
        fill: (node) => (node.data?.root ? '#E86452' : '#5B8FF9'),
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'bottom',
      },
    },
    edge: { style: { stroke: '#C5CEDB', lineWidth: 1.5 } },
    layout: { type: 'radial', unitRadius: 110, linkDistance: 90, nodeSize: 28 },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();
  return graph;
}
```


## 继续阅读

- [布局选择](/docs/guides/layout)
- [布局参考](/docs/api/options#options-layout)