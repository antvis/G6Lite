# 交互总览 (/docs/guides/behavior-overview)





## 什么是交互 [#什么是交互]

交互（Behavior）决定用户操作图时会发生什么。比如拖动空白处平移画布，滚动滚轮缩放，点击节点切换选中状态。

## 内置交互 [#内置交互]

内置交互可直接在 `behaviors` 中使用。点击交互名称可查看配置和示例。

| 分类   | 交互名称                                           | 类型                | 功能说明                      |
| ---- | ---------------------------------------------- | ----------------- | ------------------------- |
| 导航   | [拖动画布](/docs/guides/behavior-drag-canvas)      | `drag-canvas`     | 从画布空白处拖动，平移整张图。           |
| 导航   | [缩放画布](/docs/guides/behavior-zoom-canvas)      | `zoom-canvas`     | 滚动鼠标滚轮，以画布中心为基准缩放。        |
| 选择   | [点击选中](/docs/guides/behavior-click-select)     | `click-select`    | 点击节点或边切换选中状态，点击画布空白处清空选择。 |
| 选择   | [框选](/docs/guides/behavior-brush-select)       | `brush-select`    | 拖出矩形，选中中心落在矩形内的节点。        |
| 选择   | [套索选择](/docs/guides/behavior-lasso-select)     | `lasso-select`    | 沿自由轮廓拖动，选中中心落在圈内的节点。      |
| 编辑   | [拖动节点与分组](/docs/guides/behavior-drag-node)     | `drag-node`       | 拖动节点，或从分组空白处拖动整个分组。       |
| 编辑   | [拖动边端点](/docs/guides/behavior-drag-edge)       | `drag-edge`       | 拖动已有边的端点，松开时通过事件获取重连目标。   |
| 数据探索 | [悬停高亮节点](/docs/guides/behavior-highlight-node) | `highlight-node`  | 悬停节点时，突出该节点及与它直接相连的节点和边。  |
| 数据探索 | [悬停高亮边](/docs/guides/behavior-highlight-edge)  | `highlight-edge`  | 悬停边时，突出这条边及其两端节点。         |
| 数据探索 | [邻域高亮](/docs/guides/behavior-hover-highlight)  | `hover-highlight` | 悬停时高亮节点的邻域，或高亮边及其两端节点。    |
| 数据探索 | [提示框 Tooltip](/docs/guides/behavior-tooltip)   | `tooltip`         | 悬停或点击节点和边时，显示它们的详细信息。     |

## 自定义交互 [#自定义交互]

需要复用一组业务操作时，可以把事件处理封装为自定义交互，注册后通过名称启用。 [查看自定义交互](/docs/guides/custom-behavior)

## 配置和使用 [#配置和使用]

### 基本配置 [#基本配置]

交互列表写在 `new Graph()` 的 `behaviors` 里。使用名称即可采用默认参数。省略 `behaviors` 时，默认开启滚轮缩放和画布平移。

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container,
  data,
  behaviors: ['drag-canvas', 'zoom-canvas', 'click-select'],
});

await graph.render();
```

### 配置交互参数 [#配置交互参数]

交互名称通过 `type` 指定，其他参数和 `type` 写在同一层。下方示例可以点击选中、按住 Shift 追加选择，也可以从空白处拖动框选。



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



### 动态更新交互 [#动态更新交互]

运行中通过 `setBehaviors()` 替换整份交互列表。数组中写上要启用的所有交互。

```ts
graph.setBehaviors(['drag-canvas', { type: 'zoom-canvas', sensitivity: 0.5 }]);
```

[试用动态切换示例](/docs/guides/behaviors#switch-behaviors)

### 卸载交互 [#卸载交互]

传入空数组可关闭全部交互。省略参数可恢复默认的平移和缩放。

```ts
graph.setBehaviors([]);
```

## 交互与事件 [#交互与事件]

需要在点击节点后更新业务界面时，可以用 `graph.on()` 监听 `node:click`。组件卸载时，用同一个处理函数取消监听。

```ts
const onNodeClick = ({ nodeId }: { nodeId: string }) => console.log(nodeId);
graph.on('node:click', onNodeClick);

// 组件卸载时
graph.off('node:click', onNodeClick);
```

[交互通用配置项](/docs/guides/behaviors) · [事件指南](/docs/guides/events)
