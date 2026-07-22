# Beta API 迁移与发布材料补齐

## 变更内容

- 新增 beta API 迁移指南，覆盖 Graph 创建入口、统一扩展工厂、ExtensionContext、公开 Model、internal 边界、自定义布局和 ESM import 约定。
- 在官网更新日志和仓库 CHANGELOG 中记录 API 与扩展体系重新基线。
- README 新增扩展/API 边界和迁移入口，并将 TypeDoc API 参考从“建设中”调整为已完成。
- API 参考首页明确 `new Graph(options)`、deprecated 兼容符号和 `@internal` 排除规则。

## 原因

Phase 2 至 Phase 4 已完成扩展生命周期、公开查询类型和包根边界调整，但外部升级材料仍不完整。若缺少集中迁移说明，早期 beta 用户容易继续依赖 constructor、`context.graph`、`Internal*` 或源码深层路径。

## 影响

- `new Graph(options)` 和现有运行时行为不变。
- 早期 beta 用户获得明确的兼容期与推荐迁移路径。
- 当前 ESM-only 发布边界及源码 `.js` 后缀原因被显式记录。
- 本批仅修改文档和变更记录，不修改核心源码、Playground 或构建配置。
