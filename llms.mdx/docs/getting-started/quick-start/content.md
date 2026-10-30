# 安装与第一个图 (/docs/getting-started/quick-start)



G6Lite 的最小使用链路是：安装依赖、准备一个有宽高的容器、创建 `Graph`、传入数据与配置、调用 `render()`。

画布默认支持平滑滚轮缩放和拖拽平移；只有节点拖拽、选择、高亮等元素级交互需要显式配置。缩放灵敏度和范围可通过 [`zoom-canvas`](/docs/guides/interactions#缩放手感与范围) 调整。

## 安装 [#安装]

```bash
npm install @antv/g6-lite
```

## 准备容器 [#准备容器]

`container` 可以是 DOM id、选择器或 HTMLElement。容器必须有明确宽高，否则画布会退回默认尺寸。

```html
<div id="container" style="width: 800px; height: 500px"></div>
```

在实际业务中，通常让容器跟随父级布局：

```css
#container {
  width: 100%;
  height: 100%;
  min-height: 480px;
}
```

## 渲染基础图 [#渲染基础图]

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: 'container',
  data: {
    nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    edges: [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'c' },
    ],
  },
  layout: { type: 'circular', radius: 140 },
  behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
});

await graph.render();
```

## 代码做了什么 [#代码做了什么]

1. `data.nodes` 定义节点，`id` 是唯一标识，业务字段放在 `data` 中。
2. `data.edges` 定义边，`source` 和 `target` 指向节点 id。
3. `layout` 决定节点坐标；不传布局时会使用节点上的 `x` / `y`。
4. `behaviors` 启用画布缩放、画布拖拽、节点拖拽和悬停高亮。
5. `await graph.render()` 执行布局、初始化渲染管线并绘制首帧。

## 常用配置 [#常用配置]

| 选项          | 说明                                 | 继续阅读                            |
| ----------- | ---------------------------------- | ------------------------------- |
| `container` | 挂载画布的 DOM 容器                       | 本页                              |
| `data`      | 图数据，包含 `nodes`、`edges`、可选 `combos` | [数据](/docs/guides/data)         |
| `node`      | 节点类型、样式、状态样式、标签                    | [节点](/docs/guides/node)         |
| `edge`      | 边类型、样式、箭头、标签                       | [边](/docs/guides/edge)          |
| `combo`     | 节点分组容器样式                           | [Combo](/docs/guides/combo)     |
| `layout`    | 布局算法与参数                            | [布局](/docs/guides/layout)       |
| `behaviors` | 交互行为列表                             | [交互](/docs/guides/interactions) |
| `theme`     | `light`、`dark` 或 token 覆盖          | [主题](/docs/guides/theme)        |

## 更新数据 [#更新数据]

首次渲染后，可以用 `setData()` 替换整份数据：

```ts
await graph.setData({
  nodes: [{ id: 'next-a' }, { id: 'next-b' }],
  edges: [{ source: 'next-a', target: 'next-b' }],
});
```

也可以做增量更新：

```ts
graph.addNode({ id: 'd', x: 120, y: 80, data: { label: '支付服务' } });
graph.addEdge({ source: 'b', target: 'd', data: { label: '支付' } });
graph.setItemState('d', 'selected', true);
```

## 销毁实例 [#销毁实例]

页面卸载或容器被移除时，调用 `destroy()` 释放渲染器、调度器、事件和观察器。

```ts
graph.destroy();
```

## 下一步 [#下一步]

* [在框架中使用](/docs/getting-started/react)
* [理解 Graph 生命周期](/docs/concepts/graph-lifecycle)
* [选择布局](/docs/guides/layout)
* [添加交互](/docs/guides/interactions)
* [查看示例](/docs/examples)
