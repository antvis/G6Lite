# 故障排查 (/docs/compatibility/troubleshooting)



先保留最小复现和控制台错误，再一次只改变一个条件。用[快速上手](/docs/getting-started/quick-start)验证环境，不同时改数据、布局和样式。

[空白画布](#空白画布) · [图特别小](#图特别小或位置不对) · [标签不见了](#标签消失或重叠) · [安装与运行环境](#安装与运行环境)

## 空白画布 [#空白画布]

检查容器是否已挂载且非零宽高、初始化是否报错、节点 ID 和端点是否有效。先只保留两个节点与一条边，移除可选样式和扩展。

```ts
const container = document.querySelector<HTMLElement>('#container');
console.table({
  exists: Boolean(container),
  width: container?.clientWidth ?? 0,
  height: container?.clientHeight ?? 0,
  visibility: document.visibilityState,
});
```

尺寸正常仍报 WebGL 错误时，核对 GPU、宿主环境与 CSP；不要反复创建 Graph。
[环境要求](/docs/compatibility/browser) · [数据身份规则](/docs/api/options#options-data)

## 图特别小或位置不对 [#图特别小或位置不对]

先检查异常坐标、离群节点和容器尺寸，再决定 fitView 的 padding / maxZoom。首次 render、容器 resize、setData 和 layout 的适配语义不同，不要在每次用户缩放后强制适配。
[适配后图仍然很小](/docs/guides/viewport#适配后为什么图仍然很小)

## 标签消失或重叠 [#标签消失或重叠]

确认 node / edge.style.label 产生了文本，再检查缩放阈值、碰撞、颜色与容器裁剪。先关闭策略做对照，再逐项恢复。
[标签指南](/docs/guides/label) · [策略字段](/docs/api/options#options-label)

## 点击、拖拽或边事件无响应 [#点击拖拽或边事件无响应]

确认 behaviors 列表、所需 Behavior 与组合键；\[] 会关闭默认。再检查覆盖画布的 DOM、边热区和事件类型。只监听派生事件不会自动启用行为。
[交互组合](/docs/guides/behaviors) · [事件参考](/docs/api/graph/events)

## Worker 没运行或回退 [#worker-没运行或回退]

在 Network/Performance 检查模块 Worker 请求、执行线程、克隆错误和服务器响应。普通函数与循环引用配置不能直接克隆；worker: true 不是成功证据。
[Worker 部署与取消](/docs/guides/layout-worker)

## 卸载后残留或重复响应 [#卸载后残留或重复响应]

逐个匹配创建与 destroy、on 与 off、业务请求与取消。StrictMode 的额外挂载应正常清理，不通过跳过 setup 隐藏问题。
[React](/docs/getting-started/react) · [Vue](/docs/getting-started/vue) · [扩展清理](/docs/api/graph#extension-registration)

## 性能问题 [#性能问题]

### 力导向布局首屏慢怎么办？ [#力导向布局首屏慢怎么办]

分开测量布局和 render；已有坐标时省略 layout，支持时评估 Worker 与迭代参数。步骤见[性能优化](/docs/metrics/performance#performance-tuning)。

### 高亮或选中卡顿怎么办？ [#高亮或选中卡顿怎么办]

复用 Graph，通过状态 API 更新，不为一次高亮重建或替换整图。见[状态指南](/docs/guides/states)。

## 安装与运行环境 [#安装与运行环境]

### 浏览器和 WebGL 要求是什么？ [#浏览器和-webgl-要求是什么]

需要真实 DOM、Canvas 2D 和可用的 WebGL1 或 WebGL2。具体模块、Worker 和 CSP 约束见[运行环境](/docs/compatibility/browser)。

### 能在 Node.js 或 SSR 阶段直接运行吗？ [#能在-nodejs-或-ssr-阶段直接运行吗]

Graph 不能在普通 Node.js / SSR 阶段出图。在客户端挂载后创建并在卸载时销毁，见[框架接入](/docs/getting-started/react)。

### TypeScript 类型从哪里导入？ [#typescript-类型从哪里导入]

值和类型均从 `@antv/g6-lite` 包根导入，以已安装版本的类型声明为准。构造参数及数据类型见[配置项](/docs/api/options)。

### 安装后某个字段不存在怎么办？ [#安装后某个字段不存在怎么办]

先检查实际版本和包根类型，不复制开发分支字段。安装与 UMD 的已知发布物差异见[快速上手](/docs/getting-started/quick-start)。

## 选型、功能与示例 [#选型功能与示例]

### G6Lite 和 G6 v5 怎么选？ [#g6lite-和-g6-v5-怎么选]

先比较必须具备的图形、环境和交互能力，再用业务数据验证。G6Lite 的适用场景见[G6Lite 是什么](/docs)。

### Combo 可以使用吗？ [#combo-可以使用吗]

可以验证分组、嵌套和折叠，但当前仍为实验能力。使用前检查[Combo 边界](/docs/api/options#options-combo)。

### 示例能在线运行吗？ [#示例能在线运行吗]

可以在[示例中心](/docs/examples)运行；操作预期、数据说明和代码在各案例页面中。

## 提供可复现信息 [#提供可复现信息]

```text
Package version / source commit:
Framework / bundler / deployment base path:
Browser / OS / GPU / DPR / container CSS size:
Minimal GraphData and options:
Steps:
Expected / actual:
First console error and failed network request:
Does the minimal quick-start graph work?
```
