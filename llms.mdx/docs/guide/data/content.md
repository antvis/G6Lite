# 数据与配置 (/docs/guide/data)



本页介绍图数据的结构与 `Graph` 的顶层配置项。节点 / 边 / 布局 / 交互 / 主题的细节见各自的子页面。

## 数据格式 [#数据格式]

图数据通过 `data` 传入，结构为 `{ nodes, edges, combos? }`。

### nodes [#nodes]

* **id**（必填）：节点唯一标识。
* **name**（可选）：名称。
* **data**（可选）：扩展数据,可用于样式函数或业务逻辑。
* **x, y**（可选）：若不做布局或部分节点需固定位置时可传。
* **states**（可选）：初始状态数组,如 `['selected']`。
* **comboId**（可选）：所属 Combo 的 id,详见 [Combo](/docs/guide/combo)。

```ts
const nodes = [
  { id: '0', name: '节点0', data: { cluster: 'a', value: 1 } },
  { id: '1', name: '节点1', data: { cluster: 'b' } },
];
```

### edges [#edges]

* **source**（必填）：起点节点 id。
* **target**（必填）：终点节点 id。
* **data**（可选）：边的扩展数据。

```ts
const edges = [
  { source: '0', target: '1', data: { weight: 2 } },
];
```

## 图配置项 [#图配置项]

`Graph` 的配置对象支持以下字段：

| 选项            | 类型                      | 说明                                                    |
| ------------- | ----------------------- | ----------------------------------------------------- |
| **container** | `string \| HTMLElement` | 挂载画布的容器（选择器或 DOM）                                     |
| **data**      | `GraphData`             | 图数据 `{ nodes, edges, combos? }`                       |
| **node**      | `NodeConfig`            | [节点](/docs/guide/node)类型与样式                           |
| **edge**      | `EdgeConfig`            | [边](/docs/guide/edge)类型与样式                            |
| **combo**     | `ComboConfig`           | Combo 样式,详见 [Combo](/docs/guide/combo)                |
| **layout**    | `LayoutConfig`          | [布局](/docs/guide/layout)类型与参数                         |
| **behaviors** | `BehaviorOption[]`      | [交互](/docs/guide/behavior)列表                          |
| **theme**     | `ThemeOption`           | [主题](/docs/guide/theme)：`'light'` / `'dark'` 或带覆盖项的对象 |

创建 `Graph` 后必须调用 `await graph.render()` 才会执行布局并绘制;销毁时调用 `graph.destroy()`。完整方法签名见 [API 参考](/docs/api)。

## 下一步 [#下一步]

* [节点样式](/docs/guide/node) — circle / rect 与样式、状态覆盖。
* [边样式](/docs/guide/edge) — line / arc / cubic / polyline 与箭头。
* [布局](/docs/guide/layout) — 14 种内置布局与参数。
* [交互](/docs/guide/behavior) — 缩放、拖拽、高亮、选中、Tooltip。
* [主题](/docs/guide/theme) — light / dark 与 token 覆盖。
