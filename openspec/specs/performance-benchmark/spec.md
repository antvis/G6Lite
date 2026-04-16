# Performance Benchmark — 渲染与交互性能压测系统

## Purpose

为 G6Lite 提供浏览器内可视化压测页面（`/bench.html`），自动运行不同数据规模下的渲染和交互性能测试，产出可视化报告。用于量化优化效果、发现性能回归、指导后续优化方向。

本规格与 `performance-optimization` 互补：optimization 规定**怎么优化**，benchmark 规定**怎么度量**。

---

## 测试场景

### R-BENCH-01: 首屏渲染（First Render）

首屏渲染 SHALL 测量从 `new Graph()` 到首帧渲染完成的端到端耗时，包含布局计算、GPU Buffer 构建、WebGL Draw Call。

**度量指标**:

| 指标 | 定义 | 单位 |
|------|------|------|
| total | `graph.render()` 端到端耗时 | ms |
| layout | 布局算法执行耗时（Force/Dagre 等） | ms |
| render | 数据处理 + GPU 上传 + Draw Call | ms |

**GIVEN** 生成 N 个节点、N×degree 条边的确定性图数据
**WHEN** 调用 `new Graph({ ... }); await graph.render()`
**THEN** 记录 total / layout / render 三项耗时
**AND** 渲染完成后立即 `graph.destroy()` 释放资源

### R-BENCH-02: 交互高亮（Highlight Delta）

高亮测试 SHALL 测量增量高亮路径（`setHighlight → processHighlightDelta → draw`）的单次耗时。

**测试方法**:
1. 创建 Graph 并渲染完成
2. 连续执行 20 次 `setHighlight`（每次高亮不同的单个节点及其关联边）
3. 每次通过 `performance.now()` 计时 `setHighlight + draw` 周期

**度量指标**: median / p95（ms）

**GIVEN** 一个已渲染的 N 节点图
**WHEN** 连续 20 次切换高亮目标节点
**THEN** 记录每次高亮更新耗时，报告 median 和 p95

### R-BENCH-03: 拖拽帧率（Drag FPS）

拖拽测试 SHALL 模拟连续 120 帧的画布平移操作，测量帧率。

**测试方法**:
1. 创建 Graph 并渲染
2. 使用 `requestAnimationFrame` 循环 120 帧
3. 每帧调用 `setCamera({ x: cam.x + 1 })` + `draw()`
4. 记录帧间隔，计算 FPS

**度量指标**: median FPS

**GIVEN** 一个已渲染的 N 节点图
**WHEN** 模拟 120 帧连续拖拽
**THEN** 报告 median FPS

### R-BENCH-04: 缩放帧率（Zoom FPS）

缩放测试 SHALL 模拟连续 120 帧的画布缩放操作，测量帧率。

**测试方法**:
1. 创建 Graph 并渲染
2. `requestAnimationFrame` 循环 120 帧
3. 每帧调整 zoom（从 1.0 → 2.0 → 1.0 往返）
4. 记录帧间隔，计算 FPS

**度量指标**: median FPS

**GIVEN** 一个已渲染的 N 节点图
**WHEN** 模拟 120 帧连续缩放
**THEN** 报告 median FPS

### R-BENCH-05: pickAt 命中检测

pickAt 测试 SHALL 测量 O(1) framebuffer 拾取的单次调用耗时。

**测试方法**:
1. 创建 Graph 并渲染
2. 调用一次 `pickAt()` 触发 lazy init
3. 连续执行 100 次 `pickAt(randomX, randomY)`
4. 记录每次耗时

**度量指标**: median（ms）

**GIVEN** 一个已渲染且 picking 已初始化的 N 节点图
**WHEN** 执行 100 次随机坐标 pickAt
**THEN** 报告 median 耗时

---

## 数据规模

### R-BENCH-06: 默认梯度与自定义输入

压测页面 SHALL 提供 4 个预设梯度和自定义输入：

| 梯度 | 节点数 | 边数（degree=3） | 用途 |
|------|--------|-----------------|------|
| XS | 100 | 300 | 基线 |
| M | 1,000 | 3,000 | 常规场景 |
| L | 5,000 | 15,000 | 目标规模 |
| XL | 10,000 | 30,000 | 压力测试 |

页面 SHALL 提供输入框允许用户自定义节点数和每节点度数（degree），与预设梯度一起或单独运行。

数据生成 SHALL 使用确定性算法（基于索引的邻接规则），保证相同参数产出相同图数据。

---

## 压测页面

### R-BENCH-07: 页面布局与交互

压测页面 SHALL 作为独立入口 `playground/bench.html`，包含以下区域：

| 区域 | 位置 | 内容 |
|------|------|------|
| Graph 预览 | 左侧 | 当前正在测试的图的实时 canvas 渲染 |
| 配置面板 | 右上 | 梯度选择（checkbox）、自定义输入、开始/停止按钮 |
| 进度指示 | 右中 | 进度条 + 当前阶段文字（如 "5,000 节点 - 拖拽帧率"） |
| 结果表格 | 下方 | 测试结果，按规模分行，按场景分列 |
| 操作按钮 | 表格下 | 复制 Markdown、导出 JSON |

**GIVEN** 用户访问 `/bench.html`
**WHEN** 页面加载完成
**THEN** 显示配置面板，4 个梯度默认全选，自定义输入为空
**AND** "开始压测" 按钮可点击

### R-BENCH-08: 进度与实时指标

压测运行期间 SHALL 实时显示：
- 当前规模和场景名称（如 "5,000 节点 - 拖拽帧率"）
- 整体进度（已完成梯度 / 总梯度）
- 当前场景的实时 FPS 或耗时

点击"停止" SHALL 中止当前压测，保留已完成的结果。

---

## 报告输出

### R-BENCH-09: 结果表格

测试完成后 SHALL 渲染结果表格：

| 列 | 内容 | 格式 |
|----|------|------|
| 规模 | "100 / 300" (节点/边) | 文本 |
| 布局 | layout 耗时 | Xms |
| 首屏总计 | total 耗时 | Xms |
| 高亮 | highlight median | X.Xms |
| 拖拽 | drag FPS median | XX FPS |
| 缩放 | zoom FPS median | XX FPS |
| Pick | pickAt median | X.Xms |

每行在对应梯度测试完成后立即填充（流式更新）。

### R-BENCH-10: 复制与导出

- "复制报告" SHALL 将结果格式化为 Markdown 表格并写入剪贴板
- "导出 JSON" SHALL 下载包含完整 `BenchResult[]` 的 JSON 文件

---

## 性能目标（参考值）

以下为 L 梯度（5,000 节点 + 15,000 边）在中端笔记本上的参考目标，非硬性门槛：

| 指标 | 参考目标 |
|------|---------|
| 首屏 total | < 80ms |
| 首屏 render | < 20ms |
| 高亮 median | < 2ms |
| 拖拽 FPS | > 50 |
| 缩放 FPS | > 50 |
| pickAt median | < 1ms |

---

## 实施顺序

| 步骤 | 内容 | 文件 |
|------|------|------|
| 1 | OpenSpec 规格文档 | `openspec/specs/performance-benchmark/spec.md` |
| 2 | 更新 README 索引 | `openspec/README.md` |
| 3 | 压测页面 HTML | `playground/bench.html` |
| 4 | 压测逻辑实现 | `playground/bench-main.ts` |

---

## 验证方式

1. 访问 `http://localhost:5174/bench.html` 页面正常加载
2. 勾选全部梯度，点击"开始压测"，4 个梯度 × 5 个场景依次执行
3. 进度条实时更新，Graph 预览区显示当前测试的图
4. 每个梯度完成后结果表格对应行立即更新
5. 自定义输入 2000 节点、度数 5，单独运行成功
6. 复制报告到剪贴板为合法 Markdown 表格
7. 导出 JSON 文件结构正确
