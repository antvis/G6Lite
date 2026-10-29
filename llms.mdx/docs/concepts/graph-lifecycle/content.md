# Graph 生命周期 (/docs/concepts/graph-lifecycle)





`Graph` 是 G6Lite 的主入口。理解它的生命周期，有助于正确组织初始化、数据更新和组件卸载。

## 创建实例 [#创建实例]

```ts
const graph = new Graph({
  container: 'container',
  data,
  layout: { type: 'force' },
});
```

构造阶段会解析容器并准备 canvas，但不会执行布局，也不会绘制图形。

## 首次渲染 [#首次渲染]

```ts
await graph.render();
```

首次渲染的主要流程如下：

<FirstRenderFlow locale="zh" />

数据、状态写入和重新布局需等待首次 `await graph.render()` 成功完成。更详细的处理步骤见[首次渲染数据流](/docs/concepts/architecture#首次渲染数据流)。

## 更新数据 [#更新数据]

替换整份数据：

```ts
await graph.setData(nextData);
```

增量更新：

```ts
graph.addNode({ id: 'n3', x: 120, y: 80 });
graph.addEdge({ source: 'n1', target: 'n3' });
graph.updateNodeData('n3', { label: '新节点' });
graph.removeNode('n2');
```

状态更新：

```ts
graph.setItemState('n1', 'selected', true);
graph.batchSetState([
  { id: 'n1', state: 'highlight', value: true },
  { id: 'n2', state: 'inactive', value: true },
]);
```

高频交互优先使用状态 API，它会走更轻的刷新路径。

## 重新布局 [#重新布局]

```ts
graph.setLayout({ type: 'dagre', rankdir: 'LR' });
await graph.layout();
```

`setLayout()` 只更新布局配置，`layout()` 才会重新计算坐标并刷新画布。

## 视口与坐标 [#视口与坐标]

常用视口 API：

```ts
graph.fitView();
graph.focusItem('n1', 40);
graph.setCamera({ zoom: 1.5 });
graph.resetCamera();
```

坐标转换：

```ts
const graphPoint = graph.screenToGraph(clientX, clientY);
const screenPoint = graph.graphToScreen(x, y);
```

### 容器尺寸变化 [#容器尺寸变化]

G6Lite 会通过 `ResizeObserver` 自动同步容器与 canvas 尺寸，调用 `setSize(width, height)` 时也会走相同的视口更新流程。默认情况下，这两种变化都会保留当前 camera，避免覆盖用户手动缩放和平移。

可变分栏、侧栏展开收起等场景可以在创建 Graph 时开启自动适应：

```ts
const graph = new Graph({
  container: 'container',
  data,
  autoFitOnResize: {
    padding: 24,
    minZoom: 0.2,
    maxZoom: 1.5,
  },
});
```

`autoFitOnResize: true` 等价于尺寸变化后调用 `fitView(0.9)`，也可以直接传数值缩放系数或 `FitViewOptions`。自动适应完成后才会触发 `resize` 事件，因此监听器读取到的是最终 camera。大图或需要保留用户视口的场景建议保持默认关闭。

## 销毁 [#销毁]

```ts
graph.destroy();
```

销毁会释放 behavior、交互分发、ResizeObserver、scheduler、标签层、Combo 层和 WebGL renderer，并触发 `destroy` 事件。React、Vue 等框架中应在组件卸载时调用。
