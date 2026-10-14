# G6Lite 工程协作规范

## 工作流程

1. **控制范围**：只修改当前任务需要的文件，不顺带调整无关 API、样式或工具链。
2. **先验证后交付**：按变更范围执行测试、类型检查、构建和包清单验证。

## 项目结构

- `src/` — 核心库源码（TypeScript, ESM）
- `tests/unit/` — 单元与 API 契约测试，目录结构与 `src/` 对应
- `tests/bugfix/` — 历史缺陷回归测试
- `tests/perf/` — 性能基准、数据集、报告与运行器
- `playground/` — 示例页面（Vite dev server）
- `site/` — 官网与 API 文档站点
## 工程边界

- 公开 API 只以 `package.json#exports` 和包根导出为准，不承诺源码深层路径。
- npm 包发布 `dist/` 与 `src/`；测试、性能工具、Playground 和内部方案不得进入发布包。
- 核心库使用 TypeScript、ESM、Vite 与 WebGL，布局能力基于 `@antv/layout`。
- 不降低既有测试数量、覆盖率门槛、包体积门槛或类型安全约束。
- 不把 token、个人路径、账号权限或本地环境配置写入仓库。

## 操作安全

- 未经明确要求，不执行 git commit、push、分支发布或 npm publish。
- 删除、重命名和发布配置变更前，先确认引用关系和影响范围。
- 保留用户已有的无关本地改动，不通过重置或覆盖方式清理工作区。
