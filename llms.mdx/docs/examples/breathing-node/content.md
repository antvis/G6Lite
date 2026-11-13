# 呼吸节点 (/docs/examples/breathing-node)





用内置 breathing-node 的呼吸效果对比选中、高亮和普通状态。

## 如何体验

切换选中和高亮，观察节点动画。

## 数据说明

3 个内置 breathing-node 节点、2 条边，对比初始 selected、highlight 和普通状态。

## 完整运行代码

```ts
// Local presentation helpers in this repository are used only for the example controls.
/**
 * Breathing node demo.
 * Demonstrates the built-in breathing-node extension on selected/highlight states.
 */

import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'selected', x: 180, y: 180, data: { label: 'Selected' }, states: ['selected'] },
        { id: 'highlight', x: 360, y: 180, data: { label: 'Highlight' }, states: ['highlight'] },
        { id: 'normal', x: 540, y: 180, data: { label: 'Normal' } },
      ],
      edges: [
        { id: 'edge-selected-highlight', source: 'selected', target: 'highlight' },
        { id: 'edge-highlight-normal', source: 'highlight', target: 'normal' },
      ],
    },
    // #region breathing-options
    node: {
      type: 'breathing-node',
      style: {
        size: 36,
        fill: '#1677ff',
        stroke: '#fff',
        strokeWidth: 2,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'bottom',
        labelFontSize: 12,
      },
      stateStyles: {
        selected: { fill: '#1677ff', stroke: '#003eb3', strokeWidth: 3, haloWidth: 16 },
        highlight: { fill: '#2E8B57', stroke: '#1F6B43', strokeWidth: 3, haloWidth: 12 },
      },
    },
    // #endregion breathing-options
    edge: {
      style: {
        stroke: '#d1d5db',
        lineWidth: 2,
        endArrow: true,
      },
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'click-select'],
  });

  const ui = createDemoPanel(container, '切换选中和高亮，观察节点呼吸动画。');
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy();
    destroy();
  };

  const toggleState = (state: 'selected' | 'highlight') => {
    const active = graph.getItemStates(state).includes(state);
    graph.setItemState(state, state, !active);
  };
  try {
    await graph.render();
    ui.addAction('切换选中', () => toggleState('selected'));
    ui.addAction('切换高亮', () => toggleState('highlight'));
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```


## 继续阅读

- [自定义节点](/docs/guides/custom-node)
- [绘制契约](/docs/api/extensions#extension-drawing)