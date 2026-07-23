# 事件 (/docs/interactions/events)



通过 `graph.on()`、`graph.off()`、`graph.once()` 监听事件。

```ts
graph.on('node:click', ({ nodeId, data, event }) => {
  console.log(nodeId, data, event.clientX, event.clientY);
});
```

## 元素事件 [#元素事件]

元素事件由交互分发层统一发出。

| 事件                                       | 说明            |
| ---------------------------------------- | ------------- |
| `node:click`                             | 点击节点          |
| `edge:click`                             | 点击边           |
| `combo:click`                            | 点击 Combo      |
| `canvas:click`                           | 点击画布空白处       |
| `node:pointerover` / `node:pointerleave` | 节点悬停进入 / 离开   |
| `edge:pointerover` / `edge:pointerleave` | 边悬停进入 / 离开    |
| `node:pointerdown`                       | 在节点上按下指针      |
| `edge:pointerdown`                       | 在边上按下指针       |
| `combo:pointerdown`                      | 在 Combo 上按下指针 |
| `canvas:pointermove`                     | 画布指针移动        |
| `canvas:pointerup`                       | 画布指针抬起        |
| `canvas:wheel`                           | 画布滚轮          |

## 选择与拖拽事件 [#选择与拖拽事件]

这些事件由 behavior 发出。

| 事件                                                 | 说明           |
| -------------------------------------------------- | ------------ |
| `node:selectchange`                                | 节点选中状态变化     |
| `edge:selectchange`                                | 边选中状态变化      |
| `selection:clear`                                  | 清空选择         |
| `node:dragstart` / `node:drag` / `node:dragend`    | 节点拖拽         |
| `edge:dragstart` / `edge:drag` / `edge:dragend`    | 边端点拖拽        |
| `combo:dragstart` / `combo:drag` / `combo:dragend` | Combo 整体拖拽   |
| `brush:select` / `brush:end`                       | 框选中 / 框选结束   |
| `lasso:select` / `lasso:end`                       | 套索选择中 / 套索结束 |

## 生命周期事件 [#生命周期事件]

| 事件                | 说明                |
| ----------------- | ----------------- |
| `layout:start`    | 布局开始              |
| `layout:end`      | 布局结束，payload 包含耗时 |
| `afterrender`     | 首帧渲染完成            |
| `resize`          | 容器尺寸变化            |
| `datachange`      | `setData()` 后数据变化 |
| `afteradditem`    | 增量添加节点或边          |
| `afterremoveitem` | 删除节点或边            |
| `afterupdateitem` | 更新节点或边            |
| `destroy`         | 图实例销毁             |

## 取消监听 [#取消监听]

```ts
const handler = ({ nodeId }: { nodeId: string }) => console.log(nodeId);

graph.on('node:click', handler);
graph.off('node:click', handler);
```

一次性监听：

```ts
graph.once('afterrender', () => {
  console.log('ready');
});
```
