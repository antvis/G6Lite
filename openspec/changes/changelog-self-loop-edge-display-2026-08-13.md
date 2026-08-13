# 自环边展示优化实现记录

> 日期：2026-08-13
> 类型：功能优化
> 状态：已实施，验证通过

## 变更内容

- 保持第一条自环默认尺寸不变，将后续自环层级间距由 `15` 调整为 `24`。
- 将标签碰撞从“网格单元占用即碰撞”调整为“网格筛选候选包围盒，再判断真实相交”。
- 新增标签碰撞网格单元测试，覆盖同单元未相交、真实相交、跨单元和帧间重置。
- 新增五条自环中心标签锚点间距回归测试。
- 新增默认碰撞开启时，同网格内分离的多条自环标签全部绘制的回归测试。
- 更新自环标签 Playground，使用可读关系名称并明确一条、三条、五条自环的验收说明。

## 变更原因

原有自环层级每次只外扩 `15`，中心标签锚点实际仅相距约 `9.87px`。同时标签碰撞网格只记录 `150px` 单元是否占用，使同单元内没有真实重叠的标签也被隐藏。两者叠加造成多条自环标签展示不全。

## 影响范围

- 改善多条嵌套自环曲线、箭头和标签的分层展示。
- 更精确的标签碰撞判断会让过去被同网格误隐藏、但包围盒未相交的节点或边标签正常显示。
- 不修改公开 API、单条自环朝向、碰撞配置语义、布局、交互或发布配置。
- 未执行 commit、push、PR、DIMA 写入或 npm 发布。

## 验证结果

已通过：

```bash
npm test -- tests/unit/renderer/labelGrid.test.ts tests/unit/renderer/renderer.test.ts tests/unit/renderer/labelRenderer.test.ts
npm run lint
npm run typecheck
npm test -- --coverage
npm run build
npm run build:playground
npm run examples:check
npm pack --dry-run --json
```

结果：

- 定向 3 个测试文件、85 项测试通过。
- 全量 35 个测试文件、500 项测试通过，覆盖率门槛满足。
- lint、类型检查、库构建、包清单检查和 Playground 构建通过。
- 45 个 Playground smoke 示例通过。
- 发布包未混入 Playground HTML 或 assets。
- Chromium 中的 center、start、end、拖动和缩放视觉验收通过；1、3、5 条自环的全部标签可见，控制台无错误。
- 后续与边交互热区改动合并复验时，`npm run size` 的 dagre 组合为 `121.5 kB`，超既有 `120 kB` 门槛 `1.5 kB`；`origin/master` 基线同样超限，未修改门槛。
