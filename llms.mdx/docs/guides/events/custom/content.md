# 自定义事件 (/docs/guides/events/custom)



## 用按钮触发事件 [#用按钮触发事件]

以工具栏的「重置视图」按钮为例。首次渲染完成后，调用 `bindResetButton(graph, resetButton)`。函数先用 `graph.on()` 注册重置视图的动作，再绑定按钮的点击事件。

```ts
import type { Graph } from '@antv/g6-lite';

export function bindResetButton(graph: Graph, resetButton: HTMLButtonElement) {
  const resetView = () => graph.resetCamera();
  const onClick = () => graph.emit('business:reset', { source: 'toolbar' });

  graph.on('business:reset', resetView);
  resetButton.addEventListener('click', onClick);

  return () => {
    resetButton.removeEventListener('click', onClick);
    graph.off('business:reset', resetView);
  };
}
```

用户点击按钮时，点击处理函数调用 `graph.emit()`，同步执行已经注册的监听。用户可以先缩放或平移，再点击按钮观察效果。`resetCamera()` 将视图恢复到首次渲染时的位置和缩放比例。晚于这次点击注册的监听，从下一次触发开始接收事件。页面卸载时调用函数返回的清理函数。

## 为事件添加 TypeScript 类型 [#为事件添加-typescript-类型]

在应用的 `.d.ts` 文件中扩充 `GraphEventMap`。TypeScript 会检查 `emit()` 传入的参数，并推导 `on()` 回调中的参数类型。

```ts
import '@antv/g6-lite';

declare module '@antv/g6-lite' {
  interface GraphEventMap {
    'business:reset': [payload: { source: 'toolbar' | 'shortcut' }];
  }
}
```

查看 [emit 签名](/docs/api/graph#emit)或[自定义交互](/docs/guides/custom-behavior)中的 Behavior 监听写法。
