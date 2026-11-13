# 图总览 (/docs/graph/overview)





## 什么是 Graph [#什么是-graph]

图由表示对象的节点和表示关系的边组成。G6Lite 的 `Graph` 实例把这些数据绘制到容器中，并提供查询元素、调整视口和监听交互的方法。

一个图实例通常经历以下步骤。

1. **创建。** 用 `new Graph(options)` 绑定容器并初始化渲染资源。
2. **渲染。** 调用并等待 `graph.render()`，完成首次布局和绘制。
3. **更新。** 复用同一个实例，用 `setData()` 更新图数据，用 `updateOptions()` 更新支持的配置。
4. **销毁。** 页面离开或组件卸载时调用 `graph.destroy()`，释放画布和监听器等资源。

<span id="使用图实例" />

## 使用 G6Lite Graph [#使用-g6lite-graph]

按[快速上手](/docs/getting-started/quick-start)安装 `@antv/g6-lite`。先在页面上准备一个已挂载、宽高非零的容器，再创建实例并渲染。

```html
<div id="container" style="width: 100%; height: 320px"></div>
```

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: '#container',
  data: {
    nodes: [
      { id: 'browser', x: 0, y: 0 },
      { id: 'api', x: 120, y: 0 },
    ],
    edges: [{ source: 'browser', target: 'api' }],
  },
});

await graph.render();
```

首次渲染完成后，就可以定位节点或更新数据。调用时序和资源清理见 [Graph 生命周期 API](/docs/api/graph#graph-lifecycle)。

<span id="容器与配置" />

## 图配置项 [#图配置项]

`GraphOptions` 是传给构造函数的配置对象。完整类型和字段细节见 [GraphOptions API](/docs/api/options#graphoptions)。

| 配置项          | 类型                                    | 默认值       | 用途                           |
| ------------ | ------------------------------------- | --------- | ---------------------------- |
| `container`  | `string \| HTMLElement`               | 必填        | 指定挂载容器。字符串使用 CSS 选择器。        |
| `data`       | `GraphData`                           | 必填        | 提供节点、边和可选的 Combo 分组。         |
| `autoFit`    | `boolean \| number \| FitViewOptions` | `false`   | 控制容器尺寸变化时是否重新适配视图。首次渲染会自动适配。 |
| `node`       | `NodeConfig`                          | 圆形节点      | 配置节点形状、样式和状态。                |
| `edge`       | `EdgeConfig`                          | 直线边       | 配置线型、箭头和状态。                  |
| `combo`      | `ComboConfig`                         | 内置样式      | 配置分组外观、标签和折叠形态。              |
| `label`      | `LabelOptions`                        | 内置策略      | 控制标签的缩放和可见性。                 |
| `layout`     | `LayoutConfig`                        | 使用数据坐标    | 指定布局算法及参数，由布局计算节点位置。         |
| `behaviors`  | `BehaviorOption[]`                    | 缩放、拖动画布   | 配置缩放、拖拽、选择等交互。               |
| `theme`      | `ThemeOption`                         | `'light'` | 设置画布和元素的默认样式。                |
| `transforms` | `TransformOption[]`                   | 无         | 按顺序处理布局前的输入数据。               |
| `plugins`    | `PluginOption[]`                      | 无         | 挂载已注册的插件。                    |

画布初始宽高由容器决定。适配方式和运行时尺寸调整见[视口与坐标](/docs/guides/viewport)。

## 图属性 [#图属性]

| 属性                                                             | 类型        | 说明                                      |
| -------------------------------------------------------------- | --------- | --------------------------------------- |
| [`graph.destroyed`](/docs/api/graph#graph-lifecycle-destroyed) | `boolean` | 只读。开始销毁后变为 `true`，可在异步数据返回后用它判断实例是否仍可用。 |

需要等待首次渲染时，使用 `await graph.render()`。

## 参考示例 [#参考示例]

### 完整的创建和配置示例 [#完整的创建和配置示例]

示例用 Dagre 将调用关系从左到右排列，将 Cache 和 Database 放进同一个 Combo。可以点击节点查看选中样式，也可以拖动或缩放画布。



```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'web', name: 'Browser' },
        { id: 'api', name: 'API' },
        { id: 'cache', name: 'Cache', comboId: 'storage' },
        { id: 'db', name: 'Database', comboId: 'storage' },
      ],
      edges: [
        { source: 'web', target: 'api', data: { protocol: 'HTTPS' } },
        { source: 'api', target: 'cache', data: { protocol: 'GET' } },
        { source: 'api', target: 'db', data: { protocol: 'SQL' } },
      ],
      combos: [{ id: 'storage' }],
    },
    // #region element-options
    node: {
      type: 'rect',
      style: {
        width: 96,
        height: 38,
        borderRadius: 8,
        fill: '#eef2ff',
        stroke: '#6366f1',
        strokeWidth: 1,
        label: (node) => node.name ?? node.id,
        labelPlacement: 'center',
        labelColor: '#1e293b',
      },
      stateStyles: { selected: { stroke: '#4338ca', strokeWidth: 3 } },
    },
    edge: {
      style: {
        stroke: '#64748b',
        endArrow: true,
        label: (_source, _target, edge) => String(edge.data?.protocol ?? ''),
        labelColor: '#334155',
        labelBackground: '#fff',
        labelBackgroundPadding: 4,
      },
    },
    combo: {
      style: {
        label: 'Storage',
        labelPlacement: 'top',
        labelColor: '#065f46',
        padding: 20,
        borderRadius: 12,
        fill: 'rgba(16,185,129,0.08)',
        stroke: '#6ee7b7',
      },
    },
    // #endregion element-options
    layout: { type: 'dagre', rankdir: 'LR', ranksep: 84, nodesep: 16, nodeSize: 96 },
    label: { hideOnLowZoom: false, scaleWithZoom: false },
    behaviors: ['click-select', 'drag-canvas', 'zoom-canvas'],
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
```


