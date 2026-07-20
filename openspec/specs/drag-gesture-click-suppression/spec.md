# Drag Gesture Click Suppression

## 背景

业务反馈：将节点 A 拖拽到节点 B 上并与 B 重合后，松开鼠标会导致节点 B 进入 `selected` 状态。G6 中不会出现该行为。

当前 G6Lite 的交互链路为：

1. `InteractionDispatcher` 在 `mousedown` 时派发 `node:pointerdown`；
2. `drag-node` 超过位移阈值后开始更新节点位置；
3. `mouseup` 后浏览器仍可能产生原生 `click`；
4. Dispatcher 在 `click` 时重新执行 `pickAt()`；
5. A、B 重合后，Picking Buffer 可能命中 B；
6. `click-select` 收到 `node:click(B)` 后将 B 设为选中。

当前实现已经按 `mousedown` / `mouseup` 坐标距离设置 `suppressNextClick`，但该判断没有与 `drag-node` 已经进入真实拖拽状态直接关联，无法完整表达“本次手势已经被拖拽行为消费”的语义。

## 参考实现

G6 5.x 使用 AntV G DragndropPlugin 管理拖拽手势：

- 通过距离和时间阈值判定 `dragstart`；
- 一旦产生过 `dragstart`，在 `pointerup` 时为事件写入 `detail.preventClick = true`；
- 事件系统随后不再派发该手势对应的 click；
- 重合位置下方的元素可以接收 `drop`，但不会因为拖拽结束收到选择 click。

G6Lite 应参考其“拖拽显式消费 click”的语义，而不是只依赖鼠标坐标差推断。

## 目标

1. 节点拖拽开始后，抑制同一手势结束时产生的 click；
2. A 拖到 B 上并重合时，B 不会被 `click-select` 误选；
3. 节点轻微抖动但未超过拖拽阈值时，仍按普通点击处理；
4. 将手势消费能力放在统一交互调度层，后续可供 combo、画布拖拽、brush、lasso 等行为复用；
5. 不改变正常 `node:click`、`edge:click`、`canvas:click` 的公开事件语义。

## 非目标

- 不改变节点重叠时 GPU Picking 的绘制优先级；
- 不实现节点碰撞或禁止节点重叠；
- 不将该行为做成业务配置开关；
- 本次不调整拖拽渲染性能和箭头增量更新逻辑。

## 技术方案

### 1. Dispatcher 维护当前手势状态

在 `attachInteraction()` 内维护一次鼠标手势的生命周期：

```ts
interface GestureState {
  pressPoint: { x: number; y: number };
  consumed: boolean;
}
```

规则：

- `mousedown` 创建新的 gesture，`consumed = false`；
- 真实拖拽开始时，将当前 gesture 标记为 `consumed = true`；
- `mouseup` 根据 `consumed` 和位移阈值决定是否抑制下一次 click；
- 原生 `click` 到达时，如果 `suppressNextClick` 为 true，则直接消费并清理标记，不再执行 `pickAt()`。

### 2. 增加内部手势消费事件

通过 Graph 内部事件总线增加一个不作为业务公开能力承诺的事件：

```ts
interaction:gesture-consume
```

Dispatcher 监听该事件并标记当前 gesture 已被消费：

```ts
const consumeGesture = () => {
  if (gesture) gesture.consumed = true;
};
```

行为在确认进入真实拖拽状态后触发：

```ts
graph.eventEmitter.emit('interaction:gesture-consume');
graph.eventEmitter.emit('node:dragstart', ...);
```

不能在 `pointerdown` 时立即消费，否则普通点击节点也会被错误抑制。

选择内部事件而不是让 `drag-node` 直接持有 Dispatcher 实例，避免 behavior 与具体调度器实现耦合，并允许其他手势行为复用。

### 3. click 抑制判定

`mouseup` 时使用以下规则：

```ts
const movedBeyondThreshold =
  Math.hypot(e.clientX - gesture.pressPoint.x, e.clientY - gesture.pressPoint.y) > clickThreshold;

suppressNextClick = gesture.consumed || movedBeyondThreshold;
```

其中：

- `gesture.consumed` 是主要语义，等价于 G6 的 `preventClick`；
- 位移阈值作为兜底，覆盖画布拖动等尚未接入手势消费事件的行为；
- 被抑制的 click 不执行 Picking，因此不会在 A、B 重合处重新命中 B。

### 4. 首期接入范围

本次首先接入：

- `drag-node` 的 `node:dragstart`；
- `drag-node` 的 `combo:dragstart`。

Dispatcher 的机制保持通用。后续 `drag-canvas`、brush、lasso 可在各自真实进入拖动状态时接入同一个内部事件，不需要继续增加独立的 suppress 标记。

### 5. 生命周期和清理

- 新的 `mousedown` 重置上一手势的临时状态；
- `mouseup` 结束 gesture，但保留一次性的 `suppressNextClick`，供紧随其后的原生 click 消费；
- click 被消费后立即将 `suppressNextClick` 重置为 false；
- teardown 时移除 `interaction:gesture-consume` 监听，避免 Graph 重建后残留监听器。

## 兼容性说明

- 普通点击：未产生 dragstart，位移未超过阈值，click 正常派发；
- 拖拽节点：产生 dragstart，click 被抑制；
- 拖拽后重合：不会执行 click 时的重新 Picking，因此 B 不会被误选；
- `node:dragstart` / `node:drag` / `node:dragend` 事件保持不变；
- 不增加业务侧必填配置，也不要求业务自行过滤下一次 click。

## 测试方案

### InteractionDispatcher

1. `mousedown` 后触发 `interaction:gesture-consume`，再 `mouseup` + `click`：
   - 不派发 `node:click` / `canvas:click`；
   - click 时不应再次使用 B 的 Picking 结果。
2. 未消费手势且位移不超过阈值：
   - 正常派发 click。
3. 未消费手势但位移超过阈值：
   - 保持现有兜底抑制行为。
4. 消费一次 click 后：
   - 后续独立点击能够正常派发。
5. teardown 后：
   - `interaction:gesture-consume` 不再影响 Dispatcher。

### drag-node 集成回归

模拟以下事件序列：

```text
pointerdown 命中 A
mousemove 超过 dragThreshold
A 的位置更新至 B
mouseup
click 时 pickAt 返回 B
```

断言：

- 产生 `node:dragstart(A)` 和 `node:dragend(A)`；
- 不产生 `node:click(B)`；
- B 不进入 `selected` 状态。

同时保留普通点击 A 可以被 `click-select` 选中的回归测试。

## 验证计划

- `npm run typecheck`
- `npm test -- --run src/__tests__/interaction.test.ts src/__tests__/behaviors.test.ts`
- `npm test`
- Playground 手动验证：
  - 单击节点正常选择；
  - 拖动 A 到空白处不会产生额外 click；
  - 拖动 A 与 B 完全重合，B 不被选择；
  - 小于阈值的轻微移动仍按点击处理。

## 风险与取舍

- 内部事件名称需要避免成为对外 API 承诺；如现有 EventEmitter 类型要求完整事件映射，需要同步补充内部类型。
- 仅依赖全局布尔值可能被多个并发指针干扰；当前 G6Lite 使用 MouseEvent 且只支持单鼠标手势，因此首期不引入 pointerId。未来支持多指触控时应升级为按 pointerId 管理 gesture。
- 当前仓库存在与交互模块重叠的未解决合并冲突，正式实现前必须先完成冲突处理，避免覆盖两侧已有修改。
