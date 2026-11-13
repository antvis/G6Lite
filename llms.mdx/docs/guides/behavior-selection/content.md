# 点击、框选与套索 (/docs/guides/behavior-selection)



[点击选中](/docs/guides/behavior-click-select) · [框选](/docs/guides/behavior-brush-select) · [套索选择](/docs/guides/behavior-lasso-select)



## 选择方式 [#选择方式]

| 操作         | 配置                                                    |
| ---------- | ----------------------------------------------------- |
| 点击节点或边切换选中 | `click-select`。开启 `multiple` 后，按住 `trigger` 指定的键可追加选择 |
| 用矩形框选节点    | `brush-select`，用 `key` 设置启动手势                         |
| 沿自由轮廓圈选节点  | `lasso-select`，用 `key` 设置启动手势                         |

## 配置与示例 [#配置与示例]

下图支持点击选中、Shift + 点击追加选择，以及从空白处拖动框选。选中节点的颜色写在 `node.stateStyles.selected`。



```ts
const behaviors = [
  { type: 'zoom-canvas', minZoom: 0.5, maxZoom: 2 },
  'drag-node',
  { type: 'click-select', multiple: true, trigger: 'shift' },
  { type: 'brush-select', key: null },
] satisfies Array<BehaviorName | BuiltInBehaviorConfig>;
```

**完整运行代码**

```ts
import { Graph, type BehaviorName, type BuiltInBehaviorConfig } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region behavior-options
  const behaviors = [
    { type: 'zoom-canvas', minZoom: 0.5, maxZoom: 2 },
    'drag-node',
    { type: 'click-select', multiple: true, trigger: 'shift' },
    { type: 'brush-select', key: null },
  ] satisfies Array<BehaviorName | BuiltInBehaviorConfig>;
  // #endregion behavior-options
  const graph = new Graph({
    container,
    data: {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((id, i) => ({
        id, x: (i % 4) * 120, y: Math.floor(i / 4) * 100,
      })),
      edges: [{ id: 'A-B', source: 'A', target: 'B' }, { id: 'D-H', source: 'D', target: 'H' }],
    },
    node: {
      style: { size: 30, label: (node) => node.id, labelOffsetY: 8 },
      stateStyles: { selected: { fill: '#873BF4', stroke: '#5B21B6', strokeWidth: 2, haloWidth: 12 } },
    },
    behaviors,
    autoFit: { padding: 60, maxZoom: 1 },
  });
  const status = document.createElement('div');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;z-index:20;background:white;color:#334155;padding:6px 10px;border-radius:6px;font:12px system-ui;';
  status.setAttribute('role', 'status');
  const updateStatus = () => {
    status.textContent = `selected nodes: ${graph.findNodesByState('selected').join(', ') || 'none'}`;
  };
  graph.on('node:selectchange', updateStatus);
  graph.on('selection:clear', updateStatus);
  graph.on('brush:end', updateStatus);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { status.remove(); destroy(); };
  try {
    await graph.render();
    updateStatus();
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



平移、框选和套索同时开启时，为它们分配不同手势。可在[选择交互示例](/docs/examples/selection-behaviors)中试用。要在选择后更新业务面板，可监听[选择事件](/docs/guides/events/selection-drag)。
