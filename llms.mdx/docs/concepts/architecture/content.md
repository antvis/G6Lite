# 技术架构 (/docs/concepts/architecture)





G6Lite 的架构目标不是覆盖所有图形和运行环境，而是在现代浏览器中用受控的公开 API、高效的图数据路径和专用 WebGL Program 支撑大规模关系图与高频分析交互。

下图展示公开入口、内核职责、协同绘制与浏览器平台之间的关系。右侧扩展通过虚线连接到对应模块，首次渲染、更新和交互的具体过程在下文展开。

<ArchitectureDiagram locale="zh" />

## 设计边界 [#设计边界]

* `Graph` 是面向使用方的主入口，组织数据、布局、渲染、交互和生命周期。
* 包根只公开稳定类型和扩展契约；`DataModel`、Renderer、Picking 与 GPU Buffer 仍是内部实现。
* 节点和边使用 WebGL 批量绘制，标签和图标使用 Canvas 2D overlay，Combo 包围框使用 Canvas 2D underlay。
* 布局通过 `@antv/layout` 按算法懒加载，耗时布局可以在 Worker 中执行。
* G6Lite 保留关系图专用的 Program、批次、Picking 和增量更新，不引入完整场景图引擎。

## 首次渲染数据流 [#首次渲染数据流]

调用 `await graph.render()` 后，运行时按以下顺序工作：

<FirstRenderFlow locale="zh" />

1. 创建当前渲染代次，执行已注册的 Transform，并解析主题与容器尺寸。
2. 配置了布局且数据非空时，根据 `layout.type` 选择算法并计算坐标，需要时在 Worker 中执行；否则使用节点已有坐标。
3. 创建 DataModel，写入节点、边、Combo、状态和布局坐标。
4. 向 Renderer 提交渲染数据，建立 RenderScheduler，挂载 InteractionDispatcher、Behaviors、LabelLayerRenderer 和 ComboRenderer。
5. 触发 `beforerender`，Renderer 处理几何数据，准备 Program 所需的连续 TypedArray 与 GPU Buffer。
6. 调用 `fitView()`，按处理后的几何范围更新相机。
7. ComboRenderer 先绘制 Canvas 2D underlay，WebGL normal pass 绘制节点和边，LabelLayerRenderer 再绘制 Canvas 2D overlay；Picking pass 按需维护命中缓冲，不是首帧必经步骤。
8. 首帧完成后触发 `afterrender`，随后挂载 ResizeObserver 和 Plugin。

异步布局、扩展初始化或浏览器让帧完成后，Graph 会重新核对当前代次和销毁状态，避免旧结果覆盖新数据。

## 高频更新路径 [#高频更新路径]

状态、位置和数据变化不会都触发完整重建。RenderScheduler 根据变更级别选择不同路径：

| 变化                                 | 主要路径                              |
| ---------------------------------- | --------------------------------- |
| 节点 selected / highlight / inactive | 状态解析与 GPU 样式 patch，必要时重新处理        |
| 边业务字段或状态                           | 完整处理，保持边类型、可见性与箭头批次一致             |
| 批量节点位置                             | 邻接数据更新、相关 Buffer 区间上传、Canvas 图层重绘 |
| 标签或 Combo 信息                       | 对应 Canvas 2D 信息层重绘                |
| 相机平移与缩放                            | 更新 uniform 后重新 draw，不重建图数据 Buffer |
| 完整数据替换或结构变化                        | 更新 DataModel，完整或部分处理渲染数据与 Buffer  |

因此频繁选择、高亮和拖拽应优先使用状态、位置和批量 API，而不是反复调用 `new Graph()`。

## 为什么同时使用 WebGL 和 Canvas 2D [#为什么同时使用-webgl-和-canvas-2d]

WebGL 适合大量同类节点和边的批量绘制、GPU Picking 与局部 Buffer 更新。文本排版、图标、标签碰撞和 Combo 包围框更适合 Canvas 2D：它能保持文字测量直接，也避免把复杂信息层全部编码进 shader。

这些图层共享相机、尺寸、DPR 和调度信号。Combo underlay 位于 WebGL 主画布下方，标签与图标 overlay 位于其上方；它们不是独立的 Graph。

## 布局与 Worker [#布局与-worker]

布局不是 Renderer 的职责。Graph 根据配置调用布局层，得到坐标后再交给 DataModel 和 Renderer：

```text
GraphData → Layout → positioned nodes → DataModel → Renderer
```

官方布局按 `layout.type` 动态加载。`worker: true` 可以降低主线程阻塞，但不会消除算法成本；迭代次数、取消语义和真实数据规模仍需要验证。

已有坐标时应省略布局并直接提供 `x` / `y`，避免重复计算。

## 交互与 Picking [#交互与-picking]

InteractionDispatcher 统一处理指针事件和命中检测，再把规范化事件分发给 Behavior：

```text
native event → GPU/CPU pick → graph event → Behavior → public state/data API
```

节点和边优先使用 GPU Picking；不可用时有受控 CPU fallback。Combo 位于 Canvas 2D underlay，使用自己的几何命中路径。Behavior 不应自行访问 framebuffer 或重复实现 Picking。

## 扩展边界 [#扩展边界]

G6Lite 支持 node、edge、label、decoration、layout、behavior、transform 和 plugin 八类扩展。推荐使用：

```ts
register(
  'behavior',
  name,
  extensionFactory(() => ({
    init(context, options) {},
    getEvents() {
      return {};
    },
    destroy() {},
  })),
);
```

扩展通过受控的 data、state、viewport 和 `requestRender()` 能力与 Graph 协作，读取只读快照并经公开方法更新数据。新扩展不应直接持有 DataModel、Renderer、WebGL context 或 GPU Buffer。

## 浏览器与降级 [#浏览器与降级]

* 优先创建 WebGL2 context，不可用时回退 WebGL1。
* Picking framebuffer 不完整或不可用时回退 CPU 命中检测。
* 标签和 Combo 保持 Canvas 2D 路径。
* WebGL context lost/restored、ResizeObserver、Worker 取消和 Graph destroy 均有明确生命周期。
* 当前包为 ESM-only，渲染需要真实 DOM、Canvas 和 WebGL，不支持服务端绘图。

完整限制见[浏览器与运行环境](/docs/compatibility/browser)和 [API 稳定性](/docs/compatibility/api-stability)。

## 对 AI Agent 的约束 [#对-ai-agent-的约束]

AI 生成 G6Lite 代码时，应只依赖架构图最上层的公开 API。内部层帮助理解性能和问题定位，但不是可直接导入的业务契约。

使用 [`$antv-g6lite-graph`](/docs/ai) 可以让 Agent 在生成代码前检查包根导入、运行环境、能力边界和真实验证要求。
