# 浏览器与运行环境 (/docs/compatibility/browser)



G6Lite 优先使用 **WebGL 2.0**，不可用时回退 **WebGL 1.0**，并辅以 **Canvas 2D** 绘制文本标签与 Combo。运行环境还必须支持当前 ESM / ES2020 发布产物，因此最低版本由 WebGL 与 JavaScript 语法支持共同决定。

## 渲染技术依赖 [#渲染技术依赖]

| 能力                         | 用途                          | API                                            |
| -------------------------- | --------------------------- | ---------------------------------------------- |
| WebGL 2.0 / 1.0            | 节点 / 边的 GPU 渲染主管线           | `getContext('webgl2')` → `getContext('webgl')` |
| `OES_standard_derivatives` | 抗锯齿等片元着色器导数计算（可选扩展，缺失时优雅降级） | `gl.getExtension(...)`                         |
| Canvas 2D                  | 文本标签、Combo 包围框绘制            | `canvas.getContext('2d')`                      |

> G6Lite **不强依赖 WebGL 2.0**，WebGL 1.0 仍是支持下限；WebGL2 用于优先获得更完整的设备能力。

## 最低浏览器版本 [#最低浏览器版本]

下表是当前未额外转译产物的语法下限，主要由 optional chaining、nullish coalescing、原生 ESM 与 WebGL 1.0 的共同支持范围决定：

| 浏览器                      | 最低版本          | 发布年份 | WebGL 1.0 | 主要限制来源                   |
| ------------------------ | ------------- | ---- | --------- | ------------------------ |
| Chrome                   | 80+           | 2020 | ✅         | ES2020 语法、原生 ESM；推荐最新稳定版 |
| Firefox                  | 74+           | 2020 | ✅         | ES2020 语法、原生 ESM；推荐最新稳定版 |
| Safari（macOS）            | 13.1+         | 2020 | ✅         | ES2020 语法下限              |
| Safari（iOS）              | 13.4+         | 2020 | ✅         | ES2020 语法下限；移动端需注意显存     |
| Edge                     | 80+（Chromium） | 2020 | ✅         | Chromium 内核；EdgeHTML 不支持 |
| Android WebView / Chrome | 80+           | 2020 | ✅         | ES2020 语法；低端机需控制渲染规模     |

G6Lite **不支持 Internet Explorer**，也不支持旧版 EdgeHTML。上述版本是语法与平台能力下限，不等于完整真机认证矩阵。当前包根为 ESM-only；如需兼容更老环境，业务侧需要自行转译并补齐所需 polyfill。

版本依据可交叉查看 [Can I Use：Optional chaining](https://caniuse.com/mdn-javascript_operators_optional_chaining)、[Chrome 80](https://developer.chrome.com/blog/new-in-chrome-80)、[Firefox 74](https://www.mozilla.org/firefox/74.0/releasenotes/) 和 [Safari 13.1](https://webkit.org/blog/10247/new-webkit-features-in-safari-13-1/)。

## 覆盖率参考 [#覆盖率参考]

按 **2026-07-29** 获取的 `caniuse-lite@1.0.30001806` 全球使用数据估算：

* 上表明确列出的浏览器家族及最低版本约覆盖 &#x2A;*90.4%** 的全球浏览器使用量。
* 在 Can I Use 收录的全部浏览器中，同时具备 WebGL 1.0 与原生 ESM 的版本约覆盖 &#x2A;*94.8%**。

计算来源为 [Can I Use：WebGL](https://caniuse.com/webgl)、[Can I Use：JavaScript modules](https://caniuse.com/es6-module) 和 [caniuse-lite](https://github.com/browserslist/caniuse-lite)。这些数字会随统计样本变化，只用于早期选型；它们不是 G6Lite 的真机通过率，也不能替代目标地区、企业内网、WebView 和低端设备测试。

## 与 sigma.js 的浏览器口径 [#与-sigmajs-的浏览器口径]

sigma.js v3 的官方 README 将产品描述为基于 WebGL、面向数千节点和边的图渲染库，并要求搭配 Graphology；其 `sigma@3.0.3` 包同时提供 ESM 和 CommonJS 构建。核对其 [README](https://github.com/jacomyal/sigma.js#readme) 与 [package.json](https://github.com/jacomyal/sigma.js/blob/main/packages/sigma/package.json) 时，官方没有给出类似本页的最低浏览器版本矩阵。

因此不能把“未写最低版本”理解为支持旧浏览器。两者都依赖 WebGL 和现代 JavaScript 工具链；区别是 G6Lite 在此明确公布未转译包的语法下限，而 sigma.js 需要使用方结合自身构建目标验证。

## WebGL 支持矩阵 [#webgl-支持矩阵]

| 特性                         | G6Lite 是否需要 | 说明                                     |
| -------------------------- | ----------- | -------------------------------------- |
| WebGL 1.0                  | **必需**      | 不支持则抛出 `WebGL not supported`，需业务侧捕获并降级 |
| WebGL 2.0                  | 可选、优先       | 可用时优先创建，不可用时自动回退 WebGL1                |
| `OES_standard_derivatives` | 可选          | 缺失时渲染仍可进行，部分边缘抗锯齿效果略有差异                |
| 硬件加速                       | 推荐          | 软件渲染（如禁用 GPU）下大规模图性能会明显下降              |

## 已知问题与注意事项 [#已知问题与注意事项]

* **CSP**：底层 `regl` 会通过动态函数编译 WebGL command。启用 Content Security Policy 时，`script-src` 需要允许 `'unsafe-eval'`；只允许 `'wasm-unsafe-eval'` 不足以运行当前版本。不允许该策略的宿主暂不在支持范围内。
* **WebGL 不可用时**：当浏览器禁用硬件加速、显卡进黑名单、或在无 GPU 的环境（部分远程桌面 / 虚拟机）中，WebGL2 和 WebGL1 context 都创建失败时，G6Lite 会抛出初始化错误。建议在初始化处 `try/catch` 并向用户提示。
* **Safari 颜色管理**：Safari 对 WebGL 画布存在色彩管理（color profile）差异，同一颜色在 Safari 与 Chrome 间可能有肉眼可辨的细微偏差，属浏览器行为，非 G6Lite bug。
* **移动端显存**：iOS / 低端 Android 设备显存与纹理尺寸上限较低，超大规模图（数十万节点）可能触发上下文丢失（context lost）。G6Lite 会监听 context lost/restored 并恢复 GPU 资源，但业务侧仍应控制单屏渲染规模。
* **高 DPR 屏幕**：在 Retina 等高 devicePixelRatio 屏幕上，画布像素数成倍增长，需权衡清晰度与性能。
* **多实例 WebGL 上下文**：浏览器对单页面活动 WebGL 上下文数量有限制（通常 8–16 个）。同一页面创建过多 Graph 实例可能导致最早的上下文被回收。

## 测试范围说明 [#测试范围说明]

当前兼容性数据以 **Chrome / Firefox / Safari / Edge 的最新稳定版**为主要测试目标，移动端以 iOS Safari 与 Android Chrome 为参考。尚未执行的 BrowserStack 扩展矩阵不作为当前版本承诺。
