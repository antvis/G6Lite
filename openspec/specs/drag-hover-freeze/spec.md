# Freeze Hover Highlight During Element Drag

## 背景

节点 A 拖拽到节点 B 上方或与 B 重合时，G6Lite 会触发 B 的 `pointerover`，随后 `hover-highlight` 高亮 B 及其邻接节点。即使拖拽后的 click 已被正确抑制，B 仍会出现蓝色描边，视觉上容易被误认为进入了选中状态。

G6 5.x 的 `hover-activate` 在画布 `dragstart` 时设置 `isFrozen = true`，在 `dragend` 时恢复为 false；冻结期间忽略 `pointerenter` / `pointerleave`，因此拖拽经过其他节点不会改变 hover 状态。

## 当前原因

G6Lite 的职责链为：

```text
canvas mousemove
→ InteractionDispatcher 重新 Picking
→ 命中 B 后派发 node:pointerover(B)
→ hover-highlight 立即高亮 B 及其邻居
→ drag-node 在 window mousemove 中继续更新 A 的位置
```

`hover-highlight` 当前没有拖拽冻结状态，也没有监听 `node:dragstart`、`combo:dragstart`、`node:dragend` 或 `combo:dragend`。

## 目标

1. 节点或 combo 拖拽期间，不因指针经过其他节点或边而切换 hover 高亮；
2. A 拖到 B 上并松开时，B 不立即出现 hover 效果；
3. 拖拽结束后，只有用户再次真实移动鼠标，才恢复正常 hover 响应；
4. 普通非拖拽场景下的 node/edge hover 行为保持不变；
5. 行为默认与 G6 对齐，不增加业务配置。

## 非目标

- 不修改 `click-select` 或拖拽 click 抑制逻辑；
- 不修改 GPU Picking 的节点重叠优先级；
- 不禁止节点重叠；
- 不改变 hover 的邻接 degree 和 inactiveState 语义。

## 技术方案

### 1. hover-highlight 增加冻结状态

在 `hoverHighlight()` 内增加：

```ts
let isFrozen = false;
```

拖拽开始和结束时切换：

```ts
const freeze = () => {
  isFrozen = true;
};

const unfreeze = () => {
  isFrozen = false;
};
```

监听事件：

```ts
node:dragstart
combo:dragstart
node:dragend
combo:dragend
```

### 2. 冻结期间忽略 hover 状态变更

以下处理器在 `isFrozen` 时直接返回：

- `onNodeOver`；
- `onEdgeOver`；
- `clearHighlight` 对应的 pointerleave 入口。

为避免 teardown 或其他主动清理也被阻止，将“事件入口”和“实际清理函数”拆开：

```ts
const onPointerLeave = () => {
  if (isFrozen) return;
  clearHighlight();
};
```

`clearHighlight()` 本身保持可强制调用。

### 3. dragend 不主动重新 Picking

`dragend` 仅解除冻结，不立即根据当前指针位置补发 hover。

原因：

- 与 G6 行为一致；
- 避免松手瞬间 B 立即高亮；
- 用户下一次真实移动鼠标时，Dispatcher 才重新推进 hover 状态机。

InteractionDispatcher 在拖拽过程中仍可以维护内部 `lastHover`，但由于 hover behavior 冻结，B 不会应用高亮状态。松手后若鼠标未移动，不会产生新的 `pointerover`。

### 4. 拖拽开始前已有 hover 的处理

与 G6 保持一致：进入冻结时不主动清除已有 hover，仅冻结后续 enter/leave 更新。这样不会在按下节点的一刻产生额外视觉闪烁。

用户拖拽结束后再次移动鼠标，正常的 pointerleave / pointerover 会清理旧状态并应用新状态。

## 测试方案

在 `hoverHighlight behavior` 测试中新增：

1. `node:dragstart` 后派发 `node:pointerover(B)`：
   - 不调用 `renderer.setHighlight()`；
   - 不给 B 或邻接节点添加 `highlight` state。
2. `node:dragend` 后但没有新 pointermove：
   - 不主动应用 B 的 hover。
3. `node:dragend` 后再次派发新的 `node:pointerover(B)`：
   - 正常恢复 hover。
4. combo 拖拽与节点拖拽使用相同冻结语义。
5. teardown 后移除所有 dragstart / dragend 监听。

本地集成验证：

```text
启用 drag-node + click-select + hover-highlight
拖拽 A 到 B 上并松开
保持鼠标不动
```

断言：

- B 不进入 selected；
- B 及其邻居不出现 hover 高亮；
- 再次移动鼠标后 hover 才按新位置正常响应。

## 验证计划

- `npm run typecheck`
- `npm test -- --run src/__tests__/behaviors.test.ts src/__tests__/interaction.test.ts`
- `npm test`
- Playground `custom-node-extension` 手动拖拽验证。

## 风险与取舍

- 冻结时保留拖拽开始前的 hover 状态，可能导致 A 在拖拽过程中继续保持旧高亮；这是 G6 当前行为，且比拖拽途中不断切换目标稳定。
- 如果未来希望拖拽开始时清除全部 hover，应作为单独的视觉策略评估，不能与本次 G6 对齐修复混在一起。
