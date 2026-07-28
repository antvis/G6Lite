# 浏览器与运行环境 (/docs/compatibility/browser)



G6-GL 基于 **WebGL 1.0** 渲染，辅以 **Canvas 2D** 绘制文本标签与 Combo。运行环境还必须支持当前 ESM / ES2020 发布产物，因此最低版本由 WebGL 与 JavaScript 语法支持共同决定。

## 渲染技术依赖 [#渲染技术依赖]

| 能力                         | 用途                          | API                          |
| -------------------------- | --------------------------- | ---------------------------- |
| WebGL 1.0                  | 节点 / 边的 GPU 渲染主管线           | `canvas.getContext('webgl')` |
| `OES_standard_derivatives` | 抗锯齿等片元着色器导数计算（可选扩展，缺失时优雅降级） | `gl.getExtension(...)`       |
| Canvas 2D                  | 文本标签、Combo 包围框绘制            | `canvas.getContext('2d')`    |

> G6-GL **不依赖 WebGL 2.0**，也不强依赖 ANGLE\_instanced\_arrays、VAO 等高级扩展，因此兼容性显著优于纯 WebGL2 方案的库。

## 最低浏览器版本 [#最低浏览器版本]

下表是当前未额外转译产物的语法下限，主要由 optional chaining、nullish coalescing、原生 ESM 与 WebGL 1.0 的共同支持范围决定：

| 浏览器                      | 最低版本          | WebGL 1.0 | 备注               |
| ------------------------ | ------------- | --------- | ---------------- |
| Chrome                   | 80+           | ✅         | 推荐最新稳定版          |
| Firefox                  | 74+           | ✅         | 推荐最新稳定版          |
| Safari（macOS）            | 13.1+         | ✅         | 由 ES2020 语法下限决定  |
| Safari（iOS）              | 13.4+         | ✅         | 移动端需注意纹理上限与显存    |
| Edge                     | 80+（Chromium） | ✅         | EdgeHTML 不在支持范围  |
| Android WebView / Chrome | 80+           | ✅         | 低端机显存受限，建议控制渲染规模 |

> 这些版本是语法与平台能力下限，不等于完整真机认证矩阵。G6-GL 产物为 ESM-only；如需兼容更老环境，业务侧需要自行转译并补齐所需 polyfill。

## WebGL 支持矩阵 [#webgl-支持矩阵]

| 特性                         | G6-GL 是否需要 | 说明                                     |
| -------------------------- | ---------- | -------------------------------------- |
| WebGL 1.0                  | **必需**     | 不支持则抛出 `WebGL not supported`，需业务侧捕获并降级 |
| WebGL 2.0                  | 不需要        | 即使环境为 WebGL2，G6-GL 仍以 WebGL1 上下文运行     |
| `OES_standard_derivatives` | 可选         | 缺失时渲染仍可进行，部分边缘抗锯齿效果略有差异                |
| 硬件加速                       | 推荐         | 软件渲染（如禁用 GPU）下大规模图性能会明显下降              |

## 已知问题与注意事项 [#已知问题与注意事项]

* **WebGL 不可用时**：当浏览器禁用硬件加速、显卡进黑名单、或在无 GPU 的环境（部分远程桌面 / 虚拟机）中，`getContext('webgl')` 返回 `null`，G6-GL 会抛出 `WebGL not supported`。建议在初始化处 `try/catch` 并向用户提示。
* **Safari 颜色管理**：Safari 对 WebGL 画布存在色彩管理（color profile）差异，同一颜色在 Safari 与 Chrome 间可能有肉眼可辨的细微偏差，属浏览器行为，非 G6-GL bug。
* **移动端显存**：iOS / 低端 Android 设备显存与纹理尺寸上限较低，超大规模图（数十万节点）可能触发上下文丢失（context lost）。G6-GL 监听 `WEBGL_lose_context` 相关行为，但业务侧仍应控制单屏渲染规模。
* **高 DPR 屏幕**：在 Retina 等高 devicePixelRatio 屏幕上，画布像素数成倍增长，需权衡清晰度与性能。
* **多实例 WebGL 上下文**：浏览器对单页面活动 WebGL 上下文数量有限制（通常 8–16 个）。同一页面创建过多 Graph 实例可能导致最早的上下文被回收。

## 测试范围说明 [#测试范围说明]

当前兼容性数据以 **Chrome / Firefox / Safari / Edge 的最新稳定版**为主要测试目标，移动端以 iOS Safari 与 Android Chrome 为参考。更广泛的真机矩阵（含低端机型）将在后续版本通过 BrowserStack 抽样补充。
