# 扩展体系 (/docs/guides/extensions)



先用配置表达样式与交互，配置无法表达时才开发扩展。Extension 是八类扩展的统称；Plugin 只指独立 DOM 和外围状态这一类，不等同所有扩展。

## 选择入口 [#选择入口]

| 需要完成的任务              | 教程                                                   | 详细契约                                                          |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| 复用业务节点、overlay 和装饰锚点 | [自定义节点](/docs/guides/custom-node)                    | [NodeExtension](/docs/api/extensions#nodeextension)           |
| 复用边基型、业务样式和状态        | [自定义边](/docs/guides/custom-edge)                     | [EdgeExtension](/docs/api/extensions#edgeextension)           |
| 自绘节点或边标签             | [Label Renderer](/docs/guides/custom-label-renderer) | [LabelRenderer](/docs/api/extensions#labelrenderer)           |
| 自绘节点装饰内容             | [Decoration](/docs/guides/custom-decoration)         | [DecorationRenderer](/docs/api/extensions#decorationrenderer) |
| 图内事件与交互              | [自定义交互](/docs/guides/custom-behavior)                | [Behavior 配置与契约](/docs/api/options#自定义交互契约)                   |
| 自定义坐标计算              | [自定义布局](/docs/guides/custom-layout)                  | [LayoutExtension](/docs/api/extensions#layoutextension)       |
| 渲染前转换整份数据            | [数据处理 Transform](/docs/guides/transform-overview)    | [TransformExtension](/docs/api/extensions#transformextension) |
| 独立面板、订阅和状态           | [插件总览](/docs/guides/plugins)                         | [PluginExtension](/docs/api/extensions#pluginextension)       |

每篇教程都有代码与对应画布。综合应用见[扩展体系案例](/docs/examples/extension-system)；徽章需求先看[内置装饰](/docs/examples/decoration-badges)。

## 先使用配置 [#先使用配置]

颜色、尺寸、标签、状态和 Tooltip 通常不需要新扩展。先查[节点](/docs/guides/node)、[边](/docs/guides/edge)、[标签](/docs/guides/label)与[交互](/docs/guides/behaviors)，用业务 data 驱动函数式映射。

## 注册扩展 [#注册扩展]

注册定义与 Graph 激活是两步：首次使用前 register，再在相应配置位置填写名称。完整重载、覆盖与兼容形式查[注册契约](/docs/api/extensions#extension-types)，不要重复复制内部注册表。

## 扩展实例 [#扩展实例]

绘制类描述按名称缓存，保持无状态；运行类使用返回新实例的工厂。实例作用域依类别和配置位置而异，不是统一每个 Graph 一次，见[实例作用域](/docs/api/extensions#实例作用域)。

上下文快照、状态替换、坐标与清理规则统一查[ExtensionContext](/docs/api/extensions#extensioncontext)。新代码不依赖 context.graph。

## 自定义 Layout [#自定义-layout]

坐标算法、取消信号、Graph 执行和独立计算的完整步骤已移至[自定义布局](/docs/guides/custom-layout)。仅需要重排现有图时查[布局方法](/docs/api/graph#graph-layout)，不必开发扩展。

## Decoration Renderer [#decoration-renderer]

测量、绘制、堆叠、溢出与碰撞的步骤见[装饰教程](/docs/guides/custom-decoration)；内容回调查[DecorationRenderer](/docs/api/extensions#decorationrenderer)，位置字段查[装饰配置](/docs/api/options#config-node-decoration)。

## 职责边界 [#职责边界]

绘制扩展只提供受支持基型、样式或内容，不接管拾取和内部渲染器；Label / Decoration 的定位与刷新由引擎管理。运行扩展通过公开上下文或显式注入的业务能力协作，释放自己创建的监听、DOM、计时器和异步任务。

Transform / Plugin 的选项形状及变更限制查[配置参考](/docs/api/options#options-transforms-plugins)。全部公开类型从包根导入，不使用深层源码路径。

**相关可运行示例**

* [扩展系统综合示例](/docs/examples/extension-system)
