# G6Lite — Codex 项目规范

## 工作流程

1. **先方案后实现**：任何功能开发或优化任务，先产出技术方案文档，保存到 `openspec/specs/<feature-name>/spec.md`，经确认后再开始编码。
2. **变更记录**：每次有意义的变更完成后，在 `openspec/changes/` 下新建变更文档（如 `changelog-<版本或日期>.md`），记录变更内容、原因和影响。

## 项目结构

- `src/` — 核心库源码（TypeScript, ESM）
- `playground/` — 示例与压测页面（Vite dev server）
- `openspec/specs/` — 技术方案与规格文档
- `openspec/changes/` — 变更日志

## 技术栈

- TypeScript + Vite + WebGL
- 布局：@antv/layout
- 构建：tsc（库）、vite build（playground）
- CI：GitHub Actions + Surge 预览部署
