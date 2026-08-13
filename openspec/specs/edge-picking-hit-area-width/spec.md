# 边交互命中宽度优化技术方案

> 日期：2026-08-13
> 状态：已确认并完成本地实现
> 目标：在不改变边视觉线宽的前提下，提供独立、统一的边交互命中宽度

## 1. 背景

KGBase SchemaEditor 中的关系边视觉线宽约为 `1.5px`，用户需要把鼠标精确移动到细线上才能选中边。直接把视觉线宽加粗会破坏图面密度和视觉规范，因此需要让边的可见宽度与交互热区解耦。

期望业务侧可以配置：

```ts
edge: {
  style: {
    lineWidth: 1.5,
    hitAreaWidth: 16,
  },
}
```

其中边仍按 `1.5` 的视觉宽度绘制，但边中心线两侧各约 `8` 的区域可以触发 hover、click、select、tooltip 等共享 Picking 交互。

## 2. 当前实现与根因

### 2.1 公开边样式只有视觉线宽

`EdgeConfig.style` 和 `EdgeStateStyleOverride` 当前只有 `lineWidth`，没有独立命中宽度。业务无法通过公开 API 扩大热区，只能改变视觉线宽或自行实现一套边命中逻辑。

业务私有命中逻辑会绕开 `InteractionDispatcher` 的统一 Picking，容易造成 click、hover、drag、tooltip 各自判断不一致，不作为长期方案。

### 2.2 GPU Picking 复用正常渲染几何

当前 Picking Pass 直接重复绘制边、箭头、自环和节点 Program。边在 Picking Pass 中使用与正常渲染相同的几何宽度，因此可命中范围受视觉 `lineWidth` 限制。

直线、折线、弧线、自环和箭头分别由不同 Program 处理，新增能力必须在这些路径中保持一致，不能只修直线。

### 2.3 CPU fallback 使用固定直线阈值

`Renderer.hitTestEdge()` 当前固定使用 `8` 个 Graph 坐标单位作为阈值，并始终按 source-target 直线段计算：

- 阈值不可配置；
- 阈值会随 zoom 改变屏幕表现；
- arc、parallel edge、polyline、cubic 和 self-loop 都没有按真实路径命中；
- 箭头区域没有独立几何判断；
- 与 GPU Picking 的绘制宽度和覆盖顺序不一致。

因此只修改 GPU shader 或只修改 CPU 阈值都不能完成本需求。

## 3. 目标

1. 新增公开的边交互命中宽度配置，视觉宽度与命中宽度互不影响。
2. 配置沿用边线宽的渲染像素语义，保持固定屏幕宽度，不随 `camera.zoom` 放大或缩小。
3. GPU Picking 与 CPU fallback 使用同一最终命中宽度和真实边路径。
4. 覆盖直线、粗直线、平行边、弧线、折线、圆角折线、三次曲线、自环和箭头。
5. 节点可见区域与边热区重叠时继续优先命中节点。
6. hover、click、select、tooltip 和 drag-edge 等交互继续通过共享 `pickAt()` 生效，业务不增加私有事件判断。
7. 未配置新属性时保持现有视觉结果和公开调用方式不变。

## 4. 非目标

- 不通过选中态 halo、加粗视觉线或透明底边模拟交互热区。
- 不新增第二条可见边、DOM 覆盖层或业务侧 Canvas 命中层。
- 不修改节点、Combo、Label、Decoration 和框选的命中规则。
- 不调整边的颜色、dash、opacity、箭头尺寸、路由或状态视觉规范。
- 不修改 KGBase 业务仓库、版本号、发布配置或 npm 发布流程。
- 不在本方案阶段创建 DIMA、提交、推送或创建 PR。

## 5. 公开 API 设计

### 5.1 新增 `hitAreaWidth`

在边基础样式和边状态覆盖中增加：

```ts
interface EdgeConfig {
  style?: {
    lineWidth?: EdgeStyleValue<number>;
    hitAreaWidth?: EdgeStyleValue<number>;
  };
}

interface EdgeStateStyleOverride {
  lineWidth?: number;
  hitAreaWidth?: number;
}
```

`hitAreaWidth` 表示边的总命中宽度，不是在线宽两侧额外增加的 padding。

### 5.2 解析规则

- 未配置时继承最终 `lineWidth`。
- 支持静态数值、逐边函数和状态样式覆盖，与 `lineWidth` 的解析方式一致。
- 最终有效宽度为 `max(lineWidth, hitAreaWidth)`，不允许命中区域小于可见边。
- 非有限值、负数或无效函数结果回退到最终 `lineWidth`。
- dash 间隙继续按完整路径可命中，避免鼠标沿虚线移动时交互反复中断。
- `hidden` 边继续不参与 Picking；其他透明度和颜色规则保持现状。

### 5.3 像素单位

`hitAreaWidth` 沿用当前 `lineWidth` 使用的渲染像素坐标，不乘 `camera.zoom`。Renderer 负责处理 Canvas backing scale、Picking framebuffer 缩放和坐标转换，业务不得自行乘 zoom、DPR 或 framebuffer 比例。

本次不单独重定义全库视觉尺寸的 DPR 单位；`lineWidth` 与 `hitAreaWidth` 在同一环境中保持同一单位契约。

## 6. GPU Picking 方案

### 6.1 仅在 Picking Pass 使用扩大宽度

边 Program 同时携带视觉 `lineWidth` 和 `hitAreaWidth`：

```glsl
float width = u_picking
  ? max(a_lineWidth, a_hitAreaWidth)
  : a_lineWidth;
```

Normal Pass 仍使用视觉线宽，Picking Pass 才使用扩大后的命中宽度。颜色、透明度、dash 和路径计算不因新配置改变。

### 6.2 各边型处理

- `line`：当最终视觉宽度或命中宽度大于原生单像素线能力时，使用 `EdgeRectProgram` 的三角形宽线几何；不依赖兼容性不稳定的 WebGL `lineWidth`。
- `rect` 和 `polyline`：为 `EdgeRectProgram` 增加命中宽度属性，Picking Pass 只扩大法线方向宽度。
- `arc` 和自动平行边：为 `EdgeArcProgram` 增加命中宽度属性，继续复用当前曲线采样和连续 triangle strip。
- `self-loop`：为 `EdgeLoopProgram` 增加命中宽度属性，继续复用自环真实三次贝塞尔曲线。
- `cubic`：将当前 `GL_LINES` 曲线收口为与 arc 相同语义的连续宽线 strip，使视觉 `lineWidth` 和 Picking `hitAreaWidth` 都能稳定生效。
- `arrow`：Normal Pass 保持当前可见箭头宽度；Picking Pass 使用 `max(可见箭头宽度, hitAreaWidth)`，确保箭头本体和主路径热区连续。

### 6.3 Picking framebuffer

继续保留降采样 Picking framebuffer，不提升为全分辨率。扩大后的边使用三角形几何写入颜色 ID，避免原生 `GL_LINES` 在不同浏览器和降采样比例下产生不稳定宽度。

节点 Program 继续在边、self-loop 和 arrow 之后绘制，因此节点可见区域覆盖边热区时仍返回节点。

## 7. CPU fallback 方案

### 7.1 移除固定阈值

删除固定 `threshold = 8` 的直线段判断。CPU fallback 对每条边解析最终样式，使用：

```text
threshold = max(lineWidth, hitAreaWidth) / 2
```

距离计算在与 WebGL 一致的屏幕像素坐标中完成，避免命中范围随 zoom 改变。

### 7.2 复用真实路径

提取内部边路径距离工具，按实际类型判断：

- line/rect：线段距离；
- arc/parallel：二次贝塞尔采样段距离；
- cubic：三次贝塞尔采样段距离；
- polyline：实际路由和圆角采样段距离；
- self-loop：与 WebGL、自环标签相同控制点的三次贝塞尔路径；
- arrow：使用与 `EdgeArrowProgram` 相同参数构造屏幕空间箭头多边形。

曲线采样常量与对应 WebGL Program 共用或由同一内部模块导出，避免 GPU 与 CPU 使用不同精度。

### 7.3 覆盖顺序

CPU fallback 与 GPU 绘制顺序保持一致：

1. 普通边路径按绘制顺序覆盖；
2. self-loop 覆盖普通边；
3. arrow 覆盖普通边和 self-loop；
4. 节点覆盖全部边元素。

同一层内后绘制元素优先。返回值仍是原始 edge index，不改变外部事件结构。

## 8. 样式缓存和增量更新

- `CachedEdgeStyle`、`ResolvedEdgeStyle`、动态逐边样式缓存增加 `hitAreaWidth`。
- 静态配置继续走预分析快速路径；未配置新属性时不增加逐边函数调用。
- state、style 或数据更新导致命中宽度变化时，相关边 buffer 和 Picking Pass 标记为脏。
- 简单边位置增量更新继续只更新端点；样式增量更新同步 patch 视觉宽度和命中宽度。
- 不新增独立业务事件层或每次 pointermove 的全量几何重建。

## 9. 文档与示例

更新中英文 Edge 指南和公开 API 生成结果，说明：

- `lineWidth` 控制视觉宽度；
- `hitAreaWidth` 控制总交互宽度；
- 推荐细边场景使用 `lineWidth: 1.5, hitAreaWidth: 16`；
- 业务不需要自行处理 zoom 或 Picking fallback。

增加一个本地 Playground 示例，使用同一组节点展示直线、平行边、曲线、折线、自环和箭头。示例保持细线视觉，并在鼠标进入 16 宽热区时展示 hover/selected 状态，供人工验收。

## 10. 预计变更范围

- `src/types.ts`
  - 增加公开 `hitAreaWidth` 类型。
- `src/renderer/style.ts`
  - 增加静态、动态和状态样式解析。
- `src/renderer/renderer.ts`
  - 调整 Program 路由、buffer 写入、增量 patch 和 CPU fallback。
- `src/renderer/edgePath.ts` 或新增内部几何模块
  - 提取路径采样、屏幕距离和箭头命中工具。
- `src/renderer/programs/edgeRect.ts`
- `src/renderer/programs/edgeArc.ts`
- `src/renderer/programs/edgeCubic.ts`
- `src/renderer/programs/edgeLoop.ts`
- `src/renderer/programs/edgeArrow.ts`
- 对应 `src/renderer/programs/shaders/` 文件
  - Normal/Picking Pass 使用不同宽度。
- `tests/unit/renderer/style.test.ts`
- `tests/unit/renderer/programs/edgePrograms.test.ts`
- `tests/unit/renderer/renderer.test.ts`
- 必要的 `tests/bugfix/renderer/` 回归测试
- `tests/unit/publicApi.type-test.ts`
- `tests/unit/packageConsumer.type-test.ts`
  - 覆盖公开类型和 GPU/CPU 行为。
- `playground/demos/` 与示例注册文件
  - 增加交互热区人工验收示例。
- `site/content/docs/zh/guides/edge.mdx`
- `site/content/docs/en/guides/edge.mdx`
  - 增加使用说明。
- `openspec/changes/`
  - 实施完成后新增实现变更记录。

不修改业务仓库、package exports、依赖版本、发布脚本和站点信息架构。

## 11. 验收标准

1. `lineWidth: 1.5, hitAreaWidth: 16` 时，可见边仍保持 `1.5` 宽，边中心线两侧约 `8` 的区域可命中，超过边界后不可命中；允许真实浏览器栅格化产生不超过 `1` 个渲染像素的误差。
2. 未配置 `hitAreaWidth` 时，最终命中宽度继承视觉 `lineWidth`，不改变边的视觉结果。
3. zoom `0.5`、`1`、`2` 下，命中热区保持相同屏幕宽度。
4. DPR `1`、`2` 以及半分辨率或设备受限 Picking framebuffer 下，GPU Picking 的边界一致。
5. GPU Picking 正常和强制 `readPixels` 失败后的 CPU fallback 返回相同结果。
6. 直线、平行边、arc、polyline、圆角 polyline、cubic、self-loop 均按真实路径命中，不按 source-target 直线捷径误选。
7. 箭头本体可命中，主路径热区与箭头之间没有明显断裂。
8. 节点可见范围内优先返回节点，鼠标离开节点后进入边热区时返回边。
9. 多条边热区重叠时，GPU 与 CPU 返回相同的最终绘制层级元素。
10. `lineDash` 间隙保持可命中，hover 不因虚线间隙闪烁。
11. hover、click-select、tooltip 和 drag-edge 继续只通过共享 `pickAt()` 触发，不增加重复 Picking 或事件双发。
12. 静态大图未配置 `hitAreaWidth` 时，现有快速路径、包体积门槛和 Picking 性能基线不退化。

## 12. 验证计划

实施完成后执行：

```bash
npm test -- tests/unit/renderer/style.test.ts tests/unit/renderer/programs/edgePrograms.test.ts tests/unit/renderer/renderer.test.ts
npm run lint
npm run typecheck
npm test -- --coverage
npm run build
npm run size
npm run build:playground
npm run examples:check -- --profile smoke
npm pack --dry-run --json
git diff --check
```

另外使用真实 Chromium WebGL 环境验证 Playground 示例，至少覆盖：

- GPU Picking 正常路径；
- CPU fallback；
- zoom `0.5`、`1`、`2`；
- DPR `1`、`2`；
- 全部目标边型、箭头和节点优先级；
- 视觉线宽未被交互热区放大。

## 13. 风险与控制

- **曲线 Program 改动范围较大**：cubic 当前依赖原生 `GL_LINES`，为支持稳定宽度需要改为三角形 strip。通过 Program buffer 单测、真实 WebGL 截图和既有 mindmap 示例联合验证。
- **CPU fallback 计算增加**：fallback 本身只在 WebGL 不可用或 GPU Picking 失败后启用。继续保持节点优先和命中后短路，不把 CPU 路径引入正常 GPU pointermove 热路径。
- **配置后顶点数增加**：细直线配置较大热区时会从原生 line 路由到矩形宽线；只在视觉或命中宽度需要时发生，未配置场景保留现有路径。
- **重叠边选择变化**：CPU 将从原始索引覆盖改为真实 GPU 绘制顺序，属于一致性修正；通过重叠边、self-loop 和 arrow 回归测试锁定。
- **当前工作区存在其他改动**：实施时只在本规格列出的范围内叠加修改，不重置、覆盖或清理现有自环标签优化改动。

## 14. 实施门禁

本规格已确认并进入实施。实现完成后在 `openspec/changes/` 新增实现变更记录；完成定向测试、全量测试、类型检查、构建、包体积、Playground 和发布包清单验证后再交付。
