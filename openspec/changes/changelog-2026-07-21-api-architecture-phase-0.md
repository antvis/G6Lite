# API 与技术架构优化 Phase 0

## 变更内容

- 新增 API 与架构初始基线，记录运行链路、class 边界、Graph API 分组和扩展系统问题。
- 为 `interaction`、`renderer`、`routing`、`transforms` 补齐一级目录 `index.ts`。
- Renderer 出口明确标记为 internal，不从包根导出。

## 原因

在调整 Graph API 和扩展注册机制前，先建立稳定的模块边界与盘点基线，减少结构性改造时的意外公开 API 泄露。

## 影响

- 不改变现有包根公开 API。
- 不改变运行时行为。
- 为后续扩展范式统一和 Graph API 对照评审提供清晰入口。

## Phase 2 首批补充

- Node 扩展接入通用 registry，开始消除各类别独立注册机制。
- Label 扩展接入通用 registry，并保留渲染路径的 descriptor 缓存。
- 新增公开 `extensionFactory()`，让新工厂注册具有明确标识；裸函数分类仅保留在 beta 兼容层。
- factory 与 legacy constructor 在注册阶段被明确分类，不再通过执行异常猜测类型。
- factory 抛错时只执行一次，不会被当成 constructor 重试。
- factory / constructor 创建异常统一隔离并返回 undefined，不中断 Graph 主链路。
- `BaseNode` / `registerNode` 标记为 beta 兼容 API；示例和文档改用统一 `register('node', ...)` 工厂范式。
