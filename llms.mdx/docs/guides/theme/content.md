# 主题 (/docs/guides/theme)



`theme` 可以传字符串，也可以传覆盖 token 的对象。

## 使用预设 [#使用预设]

```ts
theme: 'light'
```

```ts
theme: 'dark'
```

## 覆盖 token [#覆盖-token]

```ts
theme: {
  type: 'light',
  canvasBackground: '#f7f8fa',
  nodeFill: '#5B8FF9',
  edgeStroke: '#d9d9d9',
  edgeLineWidth: 2,
}
```

常用 token：

| token                            | 说明     |
| -------------------------------- | ------ |
| `canvasBackground`               | 画布背景   |
| `nodeFill`                       | 默认节点填充 |
| `nodeSize`                       | 默认节点尺寸 |
| `nodeStroke` / `nodeStrokeWidth` | 默认节点描边 |
| `edgeStroke` / `edgeLineWidth`   | 默认边样式  |
| `edgeArrow`                      | 默认箭头样式 |
| `nodeStateStyles`                | 节点状态样式 |
| `edgeStateStyles`                | 边状态样式  |

## 优先级 [#优先级]

元素配置优先级高于主题 token：

```ts
new Graph({
  theme: { type: 'light', nodeFill: '#5B8FF9' },
  node: {
    style: { fill: '#61DDAA' },
  },
});
```

上例中节点会使用 `node.style.fill`。

## 相关 [#相关]

* [节点](/docs/guides/node)
* [边](/docs/guides/edge)
* [示例总览](/docs/examples)
