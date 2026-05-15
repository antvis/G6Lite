# Changelog 0.4.0 — 2026-04-15

## 边箭头视觉升级

基于设计稿 2.1 + 2.2，对边箭头渲染进行全面优化。

### Changed

- **箭头形状**：从简单三角形改为飞镖/燕尾形（dart shape），底部中间向内凹 20%，匹配设计稿箭头样式。
- **箭头宽度**：底宽 = `lineWidth + 12px`，确保所有粗细的边箭头都明显比边线宽，形成清晰的箭头标识。
- **箭头尖端偏移**：箭头尖端停在目标节点圆的边缘而非中心，避免被节点圆遮挡。
- **边体截断（clamping）**：EdgeRect 新增 `a_clampSource` / `a_clampTarget` shader 属性，有箭头的边在箭头凹口处截断，避免边体与箭头重叠。
- **默认节点大小**：主题默认 `nodeSize` 从 8px 增至 24px，匹配设计稿。
- **Playground edge-states demo**：改为完整 7 行权重 × 6 列状态矩阵，对齐设计稿 2.1 + 2.2。

### Files Modified

| 文件 | 变更 |
|------|------|
| `src/renderer/programs/edgeArrow.ts` | 重写：6 顶点飞镖形，新增 lineWidth / nodeRadius 属性 |
| `src/renderer/programs/shaders/edgeArrow.vert.ts` | 重写：飞镖形顶点计算 + 节点边缘偏移 |
| `src/renderer/programs/edgeRect.ts` | 新增 clampSource / clampTarget 属性（stride 15→17） |
| `src/renderer/programs/shaders/edgeRect.vert.ts` | 新增 clamping 逻辑 |
| `src/renderer/renderer.ts` | 传递 clamp / lineWidth / nodeRadius 给箭头和边 |
| `src/renderer/style.ts` | getArrowSize 保持不变 |
| `src/theme.ts` | nodeSize: 8→24 |
| `playground/demos/edge-states.ts` | 完整权重 × 状态矩阵 |
