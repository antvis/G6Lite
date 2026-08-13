# 边交互命中宽度实现记录

> 日期：2026-08-13
> 类型：功能实现
> 状态：已实施，验证通过

## 变更内容

- 新增公开 `edge.style.hitAreaWidth` 和状态样式覆盖，表示边的总交互命中宽度。
- 样式解析支持静态值、逐边函数和状态覆盖；未配置或非法值回退到最终视觉线宽。
- 细直线仅在显式扩大热区时从原生直线快速路径切换为三角形宽线。
- GPU Picking 为直线、折线、弧线、平行边、三次曲线、自环和箭头使用独立命中宽度，正常渲染仍使用视觉线宽。
- 三次曲线由原生 `GL_LINES` 改为连续三角形 strip，以稳定支持视觉线宽和拾取宽度。
- CPU fallback 删除固定阈值，按 zoom 换算最终命中宽度，并使用真实边路径、箭头几何与 GPU 绘制层级。
- 新增公开类型、样式解析、Program buffer、Renderer 路由和 CPU 路径回归测试。
- 新增“细边交互热区” Playground 示例，并更新中英文边指南。

## 原因

原实现的 GPU Picking 复用视觉几何，CPU fallback 又只按固定阈值判断 source-target 直线，无法在保持细线视觉的同时为不同边型提供一致的交互范围。

## 影响范围

- 新配置为可选项，未配置时保留原有视觉结果和 1px 直线快速路径。
- 虚线间隙继续可命中，隐藏边不参与 Picking，节点仍覆盖边热区。
- 未修改版本号、依赖、发布配置、package exports 或业务仓库。
- 未执行 commit、push、PR、DIMA 更新或 npm 发布。

## 验证结果

已通过：

```bash
npm test -- tests/unit/renderer/labelGrid.test.ts tests/unit/renderer/labelRenderer.test.ts tests/unit/renderer/renderer.test.ts tests/unit/renderer/style.test.ts tests/unit/renderer/programs/edgePrograms.test.ts tests/bugfix/renderer/edgeMapping.test.ts tests/unit/playgroundAutoFit.test.ts
npm run lint
npm run typecheck
npm test -- --coverage
npm run build
npm run build:playground
npm run examples:check -- --profile smoke
npm run site:build
npm pack --dry-run --json
git diff --check
```

结果：

- 定向 7 个测试文件、142 项测试通过。
- 全量 35 个测试文件、509 项测试通过，覆盖率门槛未降低。
- lint、类型检查、库构建、Playground 构建、站点构建和发布包清单检查通过。
- 46 个 Playground smoke 示例通过。
- Chromium 中 `edge-hit-area` 与 `self-loop-labels` 页面均正常就绪，控制台无错误。
- `npm run size` 中 dagre 组合为 `121.5 kB`，超既有 `120 kB` 门槛 `1.5 kB`；`origin/master` 基线同样超限，未修改门槛。
