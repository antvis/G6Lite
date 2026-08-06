# 节点命中与 Label/Decoration 可见性优化

> 日期：2026-08-06
> DIMA：2026072100117612100

## 变更内容

- 修正半分辨率 Picking Framebuffer 中圆节点 point sprite 未同步缩放的问题，Framebuffer 在设备尺寸限制下使用统一比例缩放。
- 修正 CPU fallback 将圆节点直径当作半径的问题；矩形节点按圆角矩形几何命中，重叠节点遵循后绘制优先。
- `LabelOptions` 新增 `nodeMinZoom`、`edgeMinZoom`，默认阈值保持节点 `0.3`、边 `0.5`，非法值回退默认值。
- `NodeDecorationConfig` 新增 `minZoom`、`hideOnCollision`；关闭碰撞隐藏的 Decoration 不查询也不占用碰撞网格。
- 更新中英文 Label 与扩展指南、包根公开类型契约和回归测试。
- 移除发布包内 WebGL shader 字符串的开发注释，抵消新增逻辑的包体积，未改变 shader 行为。

## 原因

- GPU point picking 与 CPU fallback 均把圆节点命中范围放大约两倍，导致鼠标在实体外仍触发交互。
- Label 最小展示 zoom 为内部常量，Decoration 缺少 zoom 门槛和碰撞开关，业务无法稳定控制低缩放展示。

## 影响

- 圆节点点选、拖拽、Hover 和 Tooltip 的命中边界与可见实体对齐。
- 业务可分别控制节点/边 Label 阈值，并按 Decoration 控制低 zoom 隐藏和碰撞策略。
- 未配置新字段时保持既有默认行为；不新增深层源码导出，不修改发布门槛。

## 验证

- 定向测试、全量单测、lint、类型检查、构建、包体积、npm 包清单和站点构建通过。
- 真实 Chromium 的 WebGL、DPR、zoom 阈值与 Decoration 碰撞场景由仓库外验证报告记录。
