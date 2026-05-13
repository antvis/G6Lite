# Changelog — 关系图类型支持评估 (2026-04-20)

## 背景

评估 6 种 G6 支持的关系图在 G6Lite 中的支持情况，能支持的新增 demo，不能支持的输出技术方案。

## Added

### Demo (playground)

- **流程图 (flowchart)**: 性能诊断决策树，dagre TB 布局 + 矩形节点按角色着色 + 边箭头 + 边标签
- **人物关系网络图 (relationship)**: 哈利波特角色关系，force 布局 + 圆形节点着色 + 边箭头 + 关系标签
- **组织架构图 (org-chart)**: 7 节点组织树，dagre TB + 大矩形节点 + 多行文字 (canvas label) + 弧线边

### 能力扩展

- **Edge Label Canvas**: `attachEdgeLabelsCanvas()` 函数 (playground/tooling.ts)，支持在边中点渲染标签文字，跟随 camera 变换

### Spec 文档

- **缩进树布局** (`openspec/specs/indented-tree-layout/spec.md`): 自研布局 + 正交边 program，预估 4-5 天
- **思维导图布局** (`openspec/specs/mindmap-layout/spec.md`): 自研布局 + S 型曲线，预估 3-4 天
- **鱼骨图布局** (`openspec/specs/fishbone-layout/spec.md`): 自研布局 + 斜角分支，预估 5-6 天

## 评估结论

| 图类型 | 支持度 | 说明 |
|--------|--------|------|
| 流程图 | 已支持 | 已新增 demo |
| 人物关系网络图 | 已支持 | 已新增 demo |
| 组织架构图 | 已支持 | 已新增 demo |
| 缩进树 | 不支持 | 需自研布局 + 正交边 |
| 思维导图 | 不支持 | 需自研布局 |
| 鱼骨图 | 不支持 | 需自研布局 |
