# 边 (/docs/guides/edge)



边通过 `edge` 配置类型与样式。

## 基础配置 [#基础配置]

```ts
edge: {
  type: 'line',
  style: {
    stroke: '#d9d9d9',
    lineWidth: 2,
    endArrow: true,
  },
}
```

## 类型 [#类型]

| 类型         | 说明           |
| ---------- | ------------ |
| `line`     | 直线，默认类型      |
| `arc`      | 弧线，适合平行边     |
| `cubic`    | 三次贝塞尔曲线      |
| `polyline` | 折线，支持正交和树图路由 |

## 样式字段 [#样式字段]

| 字段                          | 说明            |
| --------------------------- | ------------- |
| `stroke`                    | 线条颜色          |
| `lineWidth`                 | 线宽            |
| `opacity`                   | 不透明度          |
| `lineDash`                  | 虚线            |
| `startArrow` / `endArrow`   | 起点 / 终点箭头     |
| `arrowSize`                 | 箭头大小          |
| `curvature` / `curveOffset` | 弧线或曲线弯曲程度     |
| `radius`                    | 折线拐角圆角        |
| `router`                    | 折线路由，如 `orth` |
| `label*`                    | 边标签字段         |

函数式样式签名为 `(source, target, edge) => value`：

```ts
edge: {
  style: {
    stroke: (_source, _target, edge) => edge.data?.risk === 'high' ? '#ff4d4f' : '#bfbfbf',
    label: (_source, _target, edge) => (edge.data?.label as string) ?? '',
  },
}
```

## 状态样式 [#状态样式]

```ts
edge: {
  stateStyles: {
    selected: { stroke: '#1890ff', lineWidth: 3 },
    highlight: { stroke: '#faad14', lineWidth: 3 },
    inactive: { opacity: 0.15 },
  },
}
```

## 平行边与自环 [#平行边与自环]

如果同一对节点之间存在多条边，建议启用平行边处理，让边自动错开。

```ts
transforms: [
  {
    type: 'process-parallel-edges',
    distance: 18,
  },
];
```

更多说明见 [平行边与自环](/docs/guides/parallel-edges)。

## 相关 [#相关]

* [节点](/docs/guides/node)
* [标签与图标](/docs/guides/label)
* [示例总览](/docs/examples)
* [API: EdgeConfig](/docs/api)
