# 选择与拖动 (/docs/guides/events/selection-drag)





点击选择或框选改变 selected 状态，拖拽改变节点位置。先试下面的交互，再把结果同步到业务。

## 选择并移动节点 [#选择并移动节点]

单击选中，Shift+单击追加，空白处拖拽框选；拖动已选节点时整体移动。状态行显示最终节点集合。



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



## 同步选择结果 [#同步选择结果]

先在 Graph 的 behaviors 中启用 click-select、brush-select / lasso-select 或 drag-node；组合方法见[交互指南](/docs/guides/behaviors)。同步业务选择时，在多个来源的结束事件中读取最终集合：

```ts
import type { Graph } from '@antv/g6-lite';

export function observeSelection(
  graph: Graph,
  onChange: (nodes: string[], edges: string[]) => void,
) {
  const sync = () => onChange(
    graph.findNodesByState('selected'), graph.findEdgesByState('selected'),
  );
  const events = ['node:selectchange', 'edge:selectchange', 'selection:clear', 'brush:end', 'lasso:end'] as const;
  for (const event of events) graph.on(event, sync);
  sync();
  return () => { for (const event of events) graph.off(event, sync); };
}
```

一次操作可能回调多次（先清空再选中）。昂贵 UI 更新可在应用层合并；代码直接设置状态后，也应主动同步业务 UI。框选不会逐个发 node:selectchange。

## 保存拖拽结果 [#保存拖拽结果]

拖拽保存使用结束事件，读取 nodeIds 中所有节点的位置；每次 move 的 dx/dy 是从手势起点累计的图坐标位移。下面返回清理函数，保存函数的网络请求和错误处理由应用实现：

```ts
import type { Graph, GraphEventMap } from '@antv/g6-lite';

export function observeDrag(graph: Graph, save: (positions: Array<{ id: string; x: number; y: number }>) => void) {
  const onEnd = ({ nodeIds }: GraphEventMap['node:dragend'][0]) => {
    save(nodeIds.flatMap((id) => {
      const position = graph.getElementPosition(id);
      return position ? [{ id, ...position }] : [];
    }));
  };
  graph.on('node:dragend', onEnd);
  return () => graph.off('node:dragend', onEnd);
}
```

Combo 和连线拖拽的载荷不同，见[拖拽参考](/docs/api/graph/events#event-drag)；drag-edge 的新端点仍需业务验证并写回。

## 清理与性能 [#清理与性能]

保存 observeSelection / observeDrag 返回的函数，在卸载或替换订阅时调用。持久化接口的节流、取消和错误处理由应用实现。

[返回事件入门](/docs/guides/events) · [选择字段](/docs/api/graph/events#event-selection) · [拖拽字段](/docs/api/graph/events#event-drag)。
