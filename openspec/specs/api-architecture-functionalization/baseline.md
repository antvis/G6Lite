# G6-GL API 与架构基线

> 基线日期：2026-07-21
> 状态：Phase 0 初始盘点

## 1. 运行链路

`Graph → Transform → Layout → DataModel → RenderScheduler → Renderer → WebGL Programs`

交互链路：

`DOM Event → InteractionDispatcher → Graph EventEmitter → Behavior → Graph API → Scheduler`

扩展链路：

`register → Registry → per-Graph extension instance → lifecycle/context → engine capability`

## 2. class 边界

### 保留 class

| 模块 | 原因 |
| --- | --- |
| `Graph` | 稳定公开实例 API，保持 `new Graph(options)` |
| `EventEmitter` | 长期维护监听器集合和实例事件 API |
| `DataModel` | 维护图数据、索引、状态和增量变更 |
| `RenderScheduler` | 维护刷新级别、帧任务和调度状态 |
| `Renderer` | 持有 WebGL context、相机、Program 和 GPU 资源 |
| `PickingManager` | 持有拾取 framebuffer、缓存和 GL 资源 |
| `LabelLayerRenderer` / `ComboRenderer` / `LabelGrid` | 持有 Canvas、布局缓存或碰撞状态 |
| WebGL Programs | 持有 shader、buffer、uniform 和销毁生命周期 |

### function/factory/config 优先

- Behavior
- Node / Edge 扩展
- Label / Decoration renderer
- Layout 扩展
- Transform
- 配置归一化、样式解析、路由和数据转换等无状态逻辑

### Phase 3 实施结果

- `breathing-node` 使用无状态 `NodeExtension` 配置和 overlay function；`BaseNode` / `BreathingNode` 只保留 beta 兼容。
- `IndentedLayout`、`MindmapLayout`、`FishboneLayout` 已改为单次输入输出 executor function。
- 自研树布局在注册扩展之后、Worker / `@antv/layout` class 之前执行，避免不受支持的 Worker 类型退化为 RandomLayout。
- 其余 19 个生产 class 持有索引、任务、DOM/Canvas/WebGL/GPU 资源或稳定实例 API，继续保留。

## 3. Graph API 初始分组

| 分组 | 当前 API | 首轮判断 |
| --- | --- | --- |
| 生命周期 | `render`、`destroy`、`destroyed`、`isDestroyed` | 保留，统一状态语义 |
| 配置 | `updateOptions` | 评估与 G6 `getOptions/setOptions` 对齐 |
| 数据 | `setData`、`getData`、`toData`、节点/边增删改 | 保留，检查重复与批量签名 |
| 查询 | `getNodes`、`getEdges`、`getElementData`、计数和拓扑查询 | 保留，统一返回类型与命名 |
| 状态 | `setItemState`、`setElementStates`、`batchSetState`、Combo 状态 | 合并重复语义，向 element 命名收敛 |
| 布局 | `setLayout`、`layout`、`cancelLayout`、`getLayoutNodes` | 前三项保留；内部布局数据查询待评审 |
| 相机/视口 | camera、zoom、fit、size、坐标转换 | 保留，与 G6 命名逐项对照 |
| Combo | collapse/expand/toggle、成员关系、创建删除 | 保留，检查与普通 element API 的一致性 |
| 事件 | `on`、`off`、`once` | 保留，补强事件类型映射 |
| 内部候选 | `updateData(RendererData)`、`pickAt`、`pickComboAt`、`getCanvas`、`scheduleRender` | 移出根公开稳定面或明确 advanced 能力 |

完整逐方法的“当前签名 → 目标签名 → 兼容方式”表将在修改 Graph API 前补齐并再次确认。

## 4. 扩展问题与进度

| 问题 | 进度 |
| --- | --- |
| 通用 registry 同时接受实例、factory 和 constructor | 新增 `extensionFactory()` 显式工厂；旧输入保留 beta 兼容 |
| `createExtension` 通过 `try new` 判断函数类型 | 已移除执行式探测；注册阶段归一化，创建时只执行一种路径 |
| Node 使用独立 registry | 已接入通用 registry，保留 descriptor 缓存 |
| Label 使用独立 registry | 已接入通用 registry，保留渲染路径缓存 |
| Edge、Decoration 存在薄包装层 | 已使用通用 registry，后续统一缓存与覆盖规则 |
| 内置 Behavior 与自定义 Behavior 使用不同范式 | 待统一 |
| 各 runtime 扩展实例作用域不一致 | 待明确 per-graph / per-mount / per-execute 契约 |
| `ExtensionContext` 暴露完整 `graph` | 待增加受控能力后进入兼容迁移 |

## 5. 目录出口基线

| 一级目录 | 状态 |
| --- | --- |
| `behaviors` | 已有 `index.ts` |
| `extensions` | 已有 `index.ts` |
| `layout` | 已有 `index.ts` |
| `interaction` | 本阶段补齐内部出口 |
| `renderer` | 本阶段补齐内部出口，不进入包根公开 API |
| `routing` | 本阶段补齐内部出口 |
| `transforms` | 本阶段补齐内部出口 |

当前所有一级源码目录均已具备 `index.ts`。Renderer、Interaction、Routing 和 Transform 的目录出口仅用于引擎内部聚合，不从包根重新导出。

## 6. import 后缀基线

- `src/` 当前大量使用显式 `.js` 相对路径。
- 当前库构建由 `tsc` 直接生成 ESM，显式 `.js` 后缀可保证 Node ESM 产物解析。
- 构建正式采用 ESM-only，并使用 NodeNext 校验；源码 `.js` 后缀继续保留。
- 暂不发布 CJS 物理副本，避免模块级扩展 registry 形成双实例。
