# 扩展 (/docs/api/extensions)



配置覆盖不了的差异，用 `register()` 注册后再在 `GraphOptions` 里按名字引用。教程和示例见 [扩展体系](/docs/guides/extensions)、[自定义节点](/docs/guides/custom-node)、[自定义行为](/docs/guides/custom-behavior)。

```ts
import { extensionFactory, register } from '@antv/g6-lite';
```

## `register()` [#register]

```ts
register(type, name, extension): void
```

`type` 是扩展类别，`name` 是之后写进配置的名字，不能是空字符串。同一类别下后注册的同名扩展覆盖之前的定义。

| `type`         | 在配置里的用法                                     | 扩展对象要提供的能力                                                                                                                        |
| -------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `'node'`       | `node.type`                                 | `base?: 'circle' \| 'rect'`、默认 `style`、`stateStyles`、`getStyle(node)`。可选 `drawOverlay()` 画屏幕空间装饰，`getBoundaryAnchor()` 返回节点边界上的锚点 |
| `'edge'`       | `edge.type`                                 | `base?: 'line' \| 'arc' \| 'polyline' \| 'cubic'`、默认 `style`、`stateStyles`、`getStyle(source, target, edge)`                       |
| `'label'`      | `node.labelRenderer` 或 `edge.labelRenderer` | `measure(params)` 返回宽高，`draw(params)` 把内容画到 canvas                                                                                |
| `'decoration'` | `node.decorations[].renderer`               | 与标签相同的 `measure` / `draw`，数据来自装饰配置                                                                                                |
| `'layout'`     | `layout.type`                               | `execute(data, context)` 返回带 `x`、`y` 的节点。`context` 含 `width`、`height`、`signal` 和本次 `options`                                      |
| `'behavior'`   | `behaviors` 的 `type`                        | `getEvents()` 返回事件名到处理函数的映射。需要时实现 `init(context, options)` 和 `destroy()`                                                          |
| `'transform'`  | `transforms` 的 `type`                       | `beforeRender(data)` 返回新的 `GraphData`。选项变化时可以实现 `update(options)`                                                                 |
| `'plugin'`     | `plugins` 的 `type`                          | `mount(container)` 挂载独立 DOM。用 `init` / `destroy` 管理生命周期                                                                           |

节点和边扩展适合无状态的样式对象。布局、行为、转换和插件通常带内部状态，用 `extensionFactory()` 包装。

```ts
register('edge', 'dependency', {
  base: 'arc',
  style: { stroke: '#91caff', curvature: 0.2, endArrow: true },
});

register(
  'behavior',
  'pin-click',
  extensionFactory(() => {
    let context: ExtensionContext | undefined;
    return {
      init(next) {
        context = next;
      },
      getEvents() {
        return {
          'node:click': ({ nodeId }) => context?.state.set(nodeId, ['selected']),
        };
      },
    };
  }),
);
```

注册完成后再创建 Graph，或在已创建的 Graph 上通过配置引用这个名字。行为、转换和插件读取的是渲染时的注册表。

对象和零参数 class 仍能注册。对象会被尽量克隆，class 会被重新构造。有状态扩展要可预测的实例隔离时，使用 `extensionFactory()`。

## `extensionFactory()` [#extensionfactory]

```ts
extensionFactory(factory: () => Extension): () => Extension
```

标记这个函数是扩展工厂。引擎为每个 Graph 调用一次，避免多个图共享同一份闭包状态。

## 扩展上下文 [#扩展上下文]

行为、插件和部分布局在 `init(context, options)` 里收到 `ExtensionContext`。`options` 是只读配置。

| 成员                                                           | 作用             |
| ------------------------------------------------------------ | -------------- |
| `context.data.getNode(id)` / `getEdge(id)`                   | 读取只读快照         |
| `context.data.getNodeIds()` / `getEdgeIds()`                 | 当前 id 列表       |
| `context.data.updateNode(id, data)` / `updateEdge(id, data)` | 合并业务字段         |
| `context.state.set(id, states)`                              | 替换一个元素的状态列表    |
| `context.state.setAll(stateMap)`                             | 一次替换多个元素       |
| `context.state.get(id)` / `clear(id)`                        | 读取或清空状态        |
| `context.viewport.screenToGraph(point)`                      | 客户端坐标转图坐标      |
| `context.viewport.graphToScreen(point)`                      | 图坐标转客户端坐标      |
| `context.viewport.getZoom()`                                 | 当前缩放           |
| `context.requestRender()`                                    | 请求下一帧绘制        |
| `context.isDestroyed()`                                      | 所属 Graph 是否已销毁 |

`data` 返回的节点和边快照不能改字段。写入走 `updateNode`、`updateEdge` 和 `state`。

`context.graph`，以及上下文上平铺的 `screenToGraph()`、`graphToScreen()`、`getZoom()`，保留给已有扩展。新扩展使用 `data`、`state`、`viewport` 和 `requestRender()`。

## `runLayout()` [#runlayout]

不创建 Graph、只需要坐标时直接计算布局：

```ts
import { runLayout } from '@antv/g6-lite';

const result = await runLayout(
  { nodes, edges },
  { type: 'dagre', rankdir: 'LR' },
  { width: 800, height: 600 },
);

result.nodes.forEach((node) => {
  node.x;
  node.y;
});
```

```ts
runLayout(
  data: GraphData,
  config: LayoutConfig,
  viewport?: { width: number; height: number },
): Promise<LayoutResult>
```

`LayoutResult` 是 `{ nodes }`，每个节点都带数值 `x` 和 `y`。已注册的同名布局和内置的 `mindmap`、`indented`、`fishbone` 优先于 `@antv/layout`。`config.worker: true` 时，支持 Worker 的算法在 Worker 中计算，失败后回退到主线程的同一算法。

在已经渲染的 Graph 上重新布局，使用 [`graph.setLayout()`](/docs/api/graph#布局) 和 `graph.layout()`，这样坐标会写回当前图并触发绘制。
