# 扩展体系 (/docs/guides/extensions)





G6Lite 的定制能力分为三层：配置优先，函数式映射解决差异化需求，只有配置无法表达时才注册扩展。

扩展组合后的业务图效果示意：矩形业务节点、关系曲线、文字标签与评分徽章由不同扩展配合完成。

<img alt="自定义矩形节点、弧线关系、标签和评分徽章组合成业务图的示意" src="__img0" title="业务扩展组合" />

可运行示例：[扩展体系](/docs/examples/extension-system)、[节点徽章](/docs/examples/decoration-badges)。

## 先使用配置 [#先使用配置]

颜色、尺寸、标签、状态和 Tooltip 等常见需求直接通过配置完成：

```ts
const graph = new Graph({
  node: {
    style: {
      fill: (node) => getColor(node),
      label: (node) => String(node.data?.label ?? node.id),
    },
    stateStyles: {
      invalid: { stroke: '#ff4d4f', strokeWidth: 2 },
    },
  },
});
```

## 注册扩展 [#注册扩展]

配置无法表达时，从包主入口使用统一的 `register()`：

```ts
import { extensionFactory, Graph, register } from '@antv/g6-lite';

register('edge', 'business-relation', {
  base: 'arc',
  style: { stroke: '#91caff', curvature: 0.2, endArrow: true },
});
```

目前支持以下类别：

* `node`：在 circle/rect 基型上扩展样式和轻量 overlay。
* `edge`：选择内置边基型，提供默认样式、函数式样式和状态样式。
* `label`：测量并绘制节点或边的自定义 Label 内容。
* `decoration`：绘制 badge 等节点装饰内容。
* `layout`：输入 GraphData，返回节点坐标。
* `behavior`：消费统一事件，通过 `ExtensionContext` 修改状态和数据。
* `transform`：在渲染前完成通用数据转换。
* `plugin`：管理 Toolbar、Minimap 等独立 DOM 与状态生命周期。

## 扩展实例 [#扩展实例]

有内部状态的 Layout、Behavior、Transform 和 Plugin 应使用工厂注册，确保每个 Graph 获得独立实例：

```ts
import { extensionFactory, register, type ExtensionContext } from '@antv/g6-lite';

register(
  'behavior',
  'business-click',
  extensionFactory(() => {
    let context: ExtensionContext | undefined;

    return {
      init(nextContext) {
        context = nextContext;
      },
      getEvents() {
        return {
          'node:click': ({ nodeId }) => {
            context?.state.set(nodeId, ['selected']);
          },
        };
      },
    };
  }),
);
```

对象和 class constructor 注册在 beta 阶段仍然兼容。对象实例会进行尽力克隆，零参数 class 会重新构造，但只有 `extensionFactory()` 保证有状态实例隔离；新增有状态扩展应使用 factory，新增无状态扩展可直接使用配置对象。

不同类别的实例作用域如下：

| 类别                               | 实例作用域           | 生命周期                                      |
| -------------------------------- | --------------- | ----------------------------------------- |
| Node / Edge / Label / Decoration | 全局无状态描述，解析后缓存   | create；重复注册使缓存失效                          |
| Behavior                         | 每个 Graph、每次挂载   | create → init → getEvents → destroy       |
| Layout                           | 每次执行            | create → init → execute → destroy         |
| Transform                        | 每个 Graph、每个配置位置 | create → init；后续 update；Graph 销毁时 destroy |
| Plugin                           | 每个 Graph、每次挂载   | create → init → mount → destroy           |

`update()` 不是所有扩展的共同生命周期：当前只有 Transform 会在复用实例时收到 `update()`；Behavior 和 Plugin 在重新挂载时销毁旧实例并创建新实例，Layout 每次执行也使用新实例。

扩展的 create、init、destroy 以及类别能力调用都会隔离业务异常。Behavior 的单个事件 handler 也会独立隔离；错误信息包含类别、扩展名和事件名，不会中断其他 handler 或导致主图层白屏。

`ExtensionContext` 将能力分为 `data`、`state`、`viewport` 和 `requestRender()`。新增扩展不应直接依赖 `context.graph`；该字段只在 beta 迁移期保留。

`context.data.getNode()` / `getEdge()` 返回只读快照：元素记录、状态数组和顶层 `data` 对象都会复制，修改返回值不会反向修改 Graph。快照中的更深层业务对象不承诺递归克隆，数据变更仍应通过 `context.data.updateNode()` / `updateEdge()` 完成。

如果注册 Behavior 与内置 Behavior 同名，显式注册的版本优先。注册版本失败时不会自动回退到内置实现，避免配置与实际行为不一致。

完整的名称常量、options 类型、factory、显式注册函数与 Graph 激活模板见[自定义 Behavior](/docs/guides/custom-behavior)。

## 自定义 Layout [#自定义-layout]

自定义布局应注册返回 `LayoutExtension` 的工厂。通过 `Graph` 执行布局时，每次执行都会创建一个新实例，并依次调用 `init(context, options)`、`execute(data, runtime)` 和 `destroy()`：

```ts
import {
  extensionFactory,
  Graph,
  register,
  type ExtensionContext,
  type GraphData,
  type LayoutExtension,
} from '@antv/g6-lite';

interface ColumnLayoutOptions extends Record<string, unknown> {
  type: string;
  gap?: number;
}

const createColumnLayout = (): LayoutExtension<ColumnLayoutOptions> => {
  let lifecycleContext: ExtensionContext | undefined;
  let gap = 96;

  const assertActive = (signal?: AbortSignal) => {
    if (signal?.aborted || lifecycleContext?.isDestroyed()) {
      throw new DOMException('Layout aborted', 'AbortError');
    }
  };

  return {
    init(context, options) {
      lifecycleContext = context;
      gap = Number(options.gap ?? 96);
    },

    async execute(data, { width, height, signal }) {
      const nodes: Array<GraphData['nodes'][number] & { x: number; y: number }> = [];
      const startX = width / 2 - ((data.nodes.length - 1) * gap) / 2;

      for (const [index, node] of data.nodes.entries()) {
        assertActive(signal);
        nodes.push({ ...node, x: startX + index * gap, y: height / 2 });

        // 大数据布局需要定期让出主线程，取消信号才有机会被处理。
        if ((index + 1) % 200 === 0) {
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        }
      }

      assertActive(signal);
      return { nodes };
    },

    destroy() {
      lifecycleContext = undefined;
    },
  };
};

register('layout', 'business-column', extensionFactory(createColumnLayout));

const graph = new Graph({
  container: 'container',
  data: { nodes: [{ id: 'a' }, { id: 'b' }], edges: [] },
  layout: { type: 'business-column', gap: 120 },
});

await graph.render();
```

布局契约如下：

* `init()` 接收完整的 `ExtensionContext` 和布局配置。扩展只应使用 `data`、`state`、`viewport`、`requestRender()` 与 `isDestroyed()`；不要新增对已弃用 `context.graph` 的依赖。
* `execute()` 接收 `GraphData`，以及画布 CSS 视口尺寸 `width`、`height`、可选 `AbortSignal` 和只读 `options`。当前布局必须以 `execute(data, runtime)` 的 `data` 和 `runtime.options` 为准。
* `context.data` 表示 Graph 当前已经提交的数据。首次 `render()` 时它可能为空；`setData()` 或重复渲染期间，它也可能仍是上一版数据，因此不能替代本次 `execute()` 的 `data` 参数。
* 启动下一次布局、调用 `graph.cancelLayout()` 或销毁 Graph 时，当前信号会被中止。耗时布局应在循环和异步阶段检查 `signal.aborted`，停止自身的计时器或 Worker，并以 `AbortError` 尽快结束；已取消执行的结果不会应用到当前渲染代次。
* `destroy()` 在本次 `execute()` 成功、失败或取消后都会执行，用于释放该次执行创建的监听器、计时器和 Worker。布局实例不会跨多次执行共享状态。

直接调用公开 `runLayout(data, config)` 时没有所属 Graph，因此不会调用需要 `ExtensionContext` 的 `init()`，而是直接执行 `execute()`，最后仍调用 `destroy()`。需要完整 `init → execute → destroy` 生命周期时，应通过 `Graph.render()`、`graph.layout()` 或 `graph.setData()` 的 Graph 管理路径执行。

Transform 同样必须以 `beforeRender(data)` 的参数作为本次转换输入；其 `context.data` 只表示当前已经提交的 Graph 数据。

布局只负责计算并返回坐标；坐标写入、刷新调度和渲染由 Graph 完成，不需要在 `execute()` 中直接修改 DataModel 或调用内部 Renderer。

## Decoration Renderer [#decoration-renderer]

Decoration 只负责内容测量和绘制，G6Lite 负责定位、碰撞、裁剪和调度：

```ts
register('decoration', 'score-badge', {
  measure({ ctx, data }) {
    return { width: ctx.measureText(String(data)).width + 12, height: 20 };
  },
  draw({ ctx, data, layout }) {
    ctx.fillRect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    ctx.fillText(String(data), 0, 0);
  },
});

const graph = new Graph({
  node: {
    decorations: [
      {
        renderer: 'score-badge',
        placement: 'top',
        attachment: 'boundary',
        minZoom: 0.5,
        hideOnCollision: false,
        data: (node) => node.data?.score,
      },
    ],
  },
});
```

`attachment` 控制 Decoration 如何挂载到节点：`boundary`（默认）把装饰中心贴在节点边界，适合 badge；`outside` 将装饰完整放在节点外，适合外部名称；`inside` 将装饰完整收进节点内部。

`minZoom` 控制单个 Decoration 的最小展示 zoom，默认 `0`。`hideOnCollision` 默认为 `true`；设置为 `false` 后该 Decoration 允许与其他 Decoration 重叠，也不会占用碰撞网格抑制后续内容。

多个 badge 可交给 G6Lite 统一排列、排序和折叠：

```ts
{
  renderer: 'builtin-badge',
  placement: 'right',
  attachment: 'boundary',
  anchor: 'start',
  boundaryOverlap: 'half-badge',
  layout: 'stack',
  items: (node) => node.data?.badges ?? [],
  sort: 'width-desc',
  maxVisible: 3,
  overflow: 'hover-expand',
  overflowData: { kind: 'text', text: '···' },
}
```

`boundaryOverlap` 可传 CSS 像素数值，也可传 `half-badge`。后者配合 `attachment: 'boundary'` 和 `anchor: 'start'`，按靠节点 Badge 的半高自动重叠，使圆头或 Badge 中心落在节点轮廓上；`top` 纵向栈使用末项，其余方向使用首项。

`builtin-badge` 支持以下数据类型：

```ts
type NodeBadgeItem =
  | { kind: 'count'; value: number | string }
  | { kind: 'lock' | 'warning' | 'favorite' }
  | { kind: 'text'; text: string }
  | { kind: 'icon'; icon: string; iconFontFamily?: string };
```

圆形 Badge 直径为节点尺寸的 `1/3`，图标占圆形的 `2/3`；文本 Badge 高度相同，最大宽度为节点尺寸的 `1.5` 倍，超长自动省略。业务可通过 `fill/color` 覆盖默认颜色。

引擎负责逐项测量、左对齐纵向排列、稳定排序、折叠和 hover 展开；使用内置 Badge 时业务只需提供数据。

未注册、非法测量结果和业务异常会被隔离，不会导致主图层白屏。

## 职责边界 [#职责边界]

* 扩展不直接访问 Renderer、DataModel、WebGL context 或 GPU buffer。
* Behavior、Transform 和 Plugin 只能通过 `ExtensionContext` 的公开能力修改引擎状态。
* Edge Extension 复用内置 WebGL 边基型，保留批处理、拾取和箭头能力。
* Label 与 Decoration 只负责内容，定位、旋转、碰撞和刷新由 G6Lite 管理。

完整可运行代码见 `playground/demos/extension-system.ts`。
