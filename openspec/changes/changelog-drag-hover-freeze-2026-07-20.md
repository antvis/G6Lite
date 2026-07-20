# Drag Hover Freeze — 2026-07-20

## 变更内容

- `hover-highlight` 增加拖拽冻结状态；
- 节点或 combo 触发 `dragstart` 后，暂时忽略 node/edge 的 pointerover 和 pointerleave；
- `dragend` 仅解除冻结，不主动根据松手位置重新触发 hover；
- 用户再次真实移动鼠标后恢复正常 hover；
- 新增节点拖拽、combo 拖拽和已有 hover 状态保持的回归测试。

## 变更原因

节点 A 拖到节点 B 上时，InteractionDispatcher 会持续 Picking 并派发 B 的 pointerover。旧版 `hover-highlight` 在拖拽期间仍响应这些事件，导致 B 及其邻居出现高亮，视觉上容易被误认为 B 被选中。

本次对齐 G6 `hover-activate` 的行为：在 dragstart 到 dragend 期间冻结 hover 状态变化。

## 影响

- 拖拽经过其他节点时不再切换 hover 目标；
- 松手后目标节点不会立即出现 hover；
- 普通 hover、click-select 和拖拽 click 抑制逻辑保持不变；
- 不需要业务侧增加拖拽期间禁用 hover 的配置。
