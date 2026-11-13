# 浏览器与运行环境 (/docs/compatibility/browser)



Graph 在真实浏览器 DOM 容器中运行，WebGL2 优先，失败后尝试 WebGL1；文字和 Combo 还需要 Canvas 2D。构建工具的 Node.js 要求不是浏览器渲染支持。

## 渲染技术依赖 [#渲染技术依赖]

| 能力                                     | 要求与用途                                    |
| -------------------------------------- | ---------------------------------------- |
| DOM / Canvas 2D                        | 必需；容器、文字、信息层                             |
| WebGL2 / WebGL1                        | 至少一种能实际创建上下文；GPU 黑名单或远程环境可能使 API 存在但创建失败 |
| ResizeObserver / requestAnimationFrame | 尺寸观察与调度；宿主需要提供这些浏览器 API                  |
| ESM / dynamic import / AbortController | 模块加载、按需布局与取消；取决于实际发布产物和业务构建目标            |

## 最低浏览器版本 [#最低浏览器版本]

目前尚未认证 G6Lite 的最低支持版本。下表是核心代码使用的语法与 API 的最低版本参考，供确定测试起点；这些版本尚未完成 G6Lite 兼容性验收。

| 浏览器               | 核心语法与 API 下限参考 | Module Worker API 下限参考 |
| ----------------- | -------------- | ---------------------- |
| Chrome（桌面）        | 80             | 80                     |
| Edge（Chromium，桌面） | 80             | 80                     |
| Firefox（桌面）       | 74             | 114                    |
| Safari（macOS）     | 13.1           | 15                     |

核心列版本依据核心代码使用的可选链、空值合并、ResizeObserver 和 AbortController，取各项要求的最高版本；Worker 列仅表示浏览器支持模块 Worker 的起始版本。依据：[可选链](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining#browser_compatibility)、[空值合并](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing#browser_compatibility)、[ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver#browser_compatibility)、[AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController#browser_compatibility)、[Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker#browser_compatibility)。

构建目标 ES2020 只约束自身 TypeScript 的输出，不会自动降低布局依赖的语法要求。例如当前布局依赖包含私有类方法，直接加载含布局的 UMD 或按需加载相关布局时，要求可能高于上表；业务构建需要同时检查依赖、转译目标与运行时 API。未达到 Module Worker 要求时可能回退主线程，不能把回退成功记为 Worker 通过。

浏览器、WebView、GPU 驱动和打包结果共同决定是否可用。在目标版本中验证创建、渲染、缩放、布局、Worker、尺寸变化和卸载后，才能记录该版本的通过范围。移动端和企业 WebView 需要单独验收；旧 IE/EdgeHTML 不是当前目标环境。

## 覆盖率参考 [#覆盖率参考]

旧使用率百分比不能表示 G6Lite 真机通过率。本页不维护无法持续复现的全球覆盖率；记录项目实际浏览器、系统、GPU、DPR 和验证日期。

## 与 sigma.js 的浏览器口径 [#与-sigmajs-的浏览器口径]

不同图库和主版本的浏览器要求各异。选型时以目标版本的官方兼容性说明为准。

## WebGL 支持矩阵 [#webgl-支持矩阵]

WebGL1 是当前回退路径，WebGL2 不是强制要求。硬件加速、可选扩展和资源上限影响效果与吞吐，不能仅凭 WebGL 版本推算可支持的节点数。

## Worker、CSP 与部署 [#workercsp-与部署]

ESM 包通过模块 Worker URL 加载布局资源。验证部署子路径、Worker 文件、Content-Type、跨域和宿主 CSP；开启 worker: true 不证明 Worker 已运行。克隆或加载失败可能回退主线程，详见[Worker 指南](/docs/guides/layout-worker)。

底层 regl 的动态函数编译与禁止 eval 的严格 CSP 存在冲突；只允许 wasm-unsafe-eval 不能解决。先与宿主安全策略确认支持范围，不把放宽站点策略当成通用修复。

## 模块、SSR 与资源 [#模块ssr-与资源]

包根提供 ESM 和类型声明。CommonJS 应用可在客户端异步调用 `await import('@antv/g6-lite')`。Graph 在浏览器端出图。React、Vue 和 UMD 的接入步骤见[快速上手](/docs/getting-started/quick-start)。

React、Vue 等框架应在组件挂载到客户端后创建图。需求涉及任意 HTML 或 React 节点树、服务端出图或完整动画编排时，应先验证所需能力。Combo 嵌套与折叠的实验性边界见[Combo 配置](/docs/api/options#options-combo)。

高 DPR、大容器与多实例增加像素和 GPU 资源开销；上下文数量与显存上限由浏览器/设备决定。引擎监听 context lost/restored 并尝试恢复资源，但不保证宿主或业务状态自动恢复。离开页面调用 destroy。

## 测试范围说明 [#测试范围说明]

本地 Chromium 自动化只能说明所执行路径；不能视为 Safari、Firefox、移动端或企业 WebView 认证。报告需列明实际环境与未覆盖设备，按[测量记录](/docs/metrics/performance)复测业务数据。

当前公开的[性能样本](/benchmarks/graph-performance.json)记录于 2026-11-10，使用 macOS 上的无头 Chromium 151.0.7922.34 和 SwiftShader，仅覆盖固定坐标、关闭标签且不运行布局的首绘场景，未验证上表中的旧版浏览器或 Worker 路径。
