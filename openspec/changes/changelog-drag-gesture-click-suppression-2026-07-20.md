# Drag Gesture Click Suppression — 2026-07-20

## 变更内容

- `InteractionDispatcher` 增加当前手势的 `consumed` 状态；
- 新增内部 `interaction:gesture-consume` 事件；
- `drag-node` 和 combo 拖拽在真正触发 `dragstart` 时消费当前手势；
- 被消费手势对应的原生 click 不再执行 Picking 或派发元素 click；
- 保留原有位移阈值判断作为未接入行为的兜底；
- 新增节点 A 拖到节点 B 重合后，B 不会被 `click-select` 误选的回归测试。

## 变更原因

原实现仅根据 `mousedown` 与 `mouseup` 的坐标距离推断是否需要抑制 click，没有直接表达“拖拽已经开始并消费了当前手势”。拖拽结束后如果 click 被继续派发，Dispatcher 会在重合位置重新 Picking，可能命中节点 B 并触发错误选择。

本次参考 G6 的 `preventClick` 语义：一旦真实拖拽开始，该手势后续产生的 click 必须被消费。

## 影响

- 普通点击和阈值内轻微移动的行为不变；
- 节点与 combo 拖拽结束后不再产生额外 click；
- 不改变节点重合时的 Picking 顺序；
- 不需要业务增加过滤下一次 click 的临时逻辑或配置。
