# 分组通用配置项 (/docs/guides/combo)





分组的外观通过 `combo.style` 设置。成员归属写在数据里，完整示例见[分组总览](/docs/elements/combo)。

<span id="声明-combo" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="combodata" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## ComboConfig [#comboconfig]

`ComboConfig` 对应 `new Graph()` 的 `combo` 选项。`style` 设置所有分组的默认样式，单个分组可以在 `data.combos[].style` 中覆盖同名字段。

<span id="基础外观与局部覆盖" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="combo-style" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="样式" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## 分组样式 [#分组样式]

### 边框和留白 [#基础样式字段]

边框颜色和宽度分别用 `stroke` 和 `strokeWidth` 设置，底色用 `fill` 设置。边框与成员之间的留白通过 `padding` 调整。传入数组时，四周都取数组中的最大值。

### 标签样式 [#留白包围框与标签]

标签名用 `label` 设置，位置通过 `labelPlacement` 配置。`top` 和 `bottom` 分别放在边框上方和下方，`inside` 放在框内左上角，`center` 放在框内正中。`labelFontSize` 设置字号，`labelColor` 设置文字颜色。

### 按数据设置样式 [#字段回调与覆盖顺序]

样式函数接收当前分组。比如用 `combo.data` 读取业务名称，或用 `combo.childNodeIds.size` 生成直接成员数。单组样式优先于全局样式，状态样式可以进一步覆盖当前外观。

<span id="options-combo-代码与对应效果" style="{ display: 'block', scrollMarginTop: '8rem' }" />

下图左侧使用默认样式，中间的分组单独设置了橙色边框，右侧用样式函数显示成员数。展开「完整代码」可查看单组配置。



```ts
combo: { style: {
  fill: 'rgba(23,131,255,0.08)', stroke: '#1783FF', strokeWidth: 2,
  opacity: 1, borderRadius: 12, padding: 40,
  label: (combo) => String(combo.data?.name ?? combo.id),
  labelFontSize: 12, labelColor: '#1e3a8a', labelPlacement: 'top',
} },
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const groups = [{ id: 'global', x: 100 }, { id: 'local', x: 320 }, { id: 'callback', x: 540 }];
  const graph = new Graph({
    container,
    data: {
      nodes: groups.flatMap(({ id, x }) => [
        { id: id + '-a', x, y: 100, comboId: id },
        { id: id + '-b', x, y: 160, comboId: id },
      ]),
      edges: [],
      combos: [
        { id: 'global', data: { name: 'Global' } },
        { id: 'local', data: { name: 'Local' }, style: {
          fill: 'rgba(246,144,61,0.15)', stroke: '#f6903d', strokeWidth: 3,
          opacity: 0.75, borderRadius: 0, padding: 32,
          labelFontSize: 14, labelColor: '#7c2d12', labelPlacement: 'inside',
        } },
        { id: 'callback', style: {
          fill: (combo) => combo.childNodeIds.size >= 2 ? 'rgba(135,59,244,0.12)' : 'transparent',
          stroke: '#873bf4', borderRadius: 20, padding: [8, 40, 12, 24],
          label: (combo) => 'Members: ' + combo.childNodeIds.size, labelPlacement: 'bottom',
        } },
      ],
    },
    node: { style: { size: 22 } },
    // #region combo-options
    combo: { style: {
      fill: 'rgba(23,131,255,0.08)', stroke: '#1783FF', strokeWidth: 2,
      opacity: 1, borderRadius: 12, padding: 40,
      label: (combo) => String(combo.data?.name ?? combo.id),
      labelFontSize: 12, labelColor: '#1e3a8a', labelPlacement: 'top',
    } },
    // #endregion combo-options
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



全部字段、单位和默认值见[分组样式参考](/docs/api/options#config-combo-style)。

### 状态样式 [#options-combo-状态样式]

选中后的边框、底色等样式写在 `combo.style.stateStyles.selected`。单个分组也可以在自己的 `style.stateStyles` 中设置。点击示例中的分组，切换选中样式。



```ts
combo: { style: {
  padding: 28, label: (combo) => combo.id,
  stateStyles: {
    selected: { fill: 'rgba(135,59,244,0.12)', stroke: '#873bf4', strokeWidth: 3 },
    inactive: { opacity: 0.3 },
  },
} },
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const groups = [
    { id: 'Base', x: 100 }, { id: 'Selected', x: 270 },
    { id: 'Local', x: 440 }, { id: 'Inactive', x: 610 },
  ];
  const graph = new Graph({
    container,
    data: {
      nodes: groups.flatMap(({ id, x }) => [
        { id: id + '-a', x, y: 100, comboId: id },
        { id: id + '-b', x, y: 160, comboId: id },
      ]),
      edges: [],
      combos: [
        { id: 'Base' },
        { id: 'Selected', states: ['selected'] },
        { id: 'Local', states: ['selected'], style: {
          stateStyles: { selected: { stroke: '#f6903d', labelColor: '#9a3412' } },
        } },
        { id: 'Inactive', states: ['selected', 'inactive'] },
      ],
    },
    node: { style: { size: 22 } },
    // #region state-styles
    combo: { style: {
      padding: 28, label: (combo) => combo.id,
      stateStyles: {
        selected: { fill: 'rgba(135,59,244,0.12)', stroke: '#873bf4', strokeWidth: 3 },
        inactive: { opacity: 0.3 },
      },
    } },
    // #endregion state-styles
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  graph.on('combo:click', ({ comboId }) => {
    const selected = graph.getComboData(comboId)?.states.has('selected') ?? false;
    graph.setItemState(comboId, 'selected', !selected);
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



多个状态按 `active → highlight → selected → disabled → inactive` 的顺序应用。同一字段取后应用的值。可覆盖的字段见[状态样式参考](/docs/api/options#config-combo-state-style)。

## 折叠与展开 [#折叠与展开]

初始折叠通过分组数据里的 `collapsed: true` 设置。渲染后，`collapseCombo()` 收起分组，`expandCombo()` 展开分组，`toggleCombo()` 在两者之间切换。下面的示例用点击切换。

```ts
graph.on('combo:click', ({ comboId }) => graph.toggleCombo(comboId));
```

### 折叠后的形状和文字 [#折叠形态]

折叠后的形状用 `collapsedType` 设置，尺寸用 `collapsedSize` 设置。折叠文字优先显示 `label`。省略 `label` 时，默认显示后代节点数，也可以用 `count` 指定文字。

| 形状                                         | 配置                                                              |
| ------------------------------------------ | --------------------------------------------------------------- |
| <span id="combo-collapsed-circle" />圆形（默认） | `collapsedType: 'circle'`，`collapsedSize: 64` 表示直径 64           |
| <span id="combo-collapsed-rect" />矩形       | `collapsedType: 'rect'`，`collapsedSize: [120, 48]` 表示宽 120、高 48 |

下图从左到右分别显示节点数、自定义计数文字和分组名称。点击任一分组可查看展开后的边框。



```ts
combos: [
  { id: 'circle', collapsed: true },
  { id: 'rect', collapsed: true, style: {
    collapsedType: 'rect', collapsedSize: [120, 48],
    count: (combo) => 'Items: ' + combo.childNodeIds.size,
  } },
  { id: 'label', collapsed: true, style: {
    collapsedType: 'rect', collapsedSize: [120, 48], label: 'Archive',
  } },
],
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const groups = [{ id: 'circle', x: 100 }, { id: 'rect', x: 300 }, { id: 'label', x: 500 }];
  const graph = new Graph({
    container,
    data: {
      nodes: groups.flatMap(({ id, x }) => [
        { id: id + '-a', x: x - 24, y: 100, comboId: id },
        { id: id + '-b', x: x + 24, y: 160, comboId: id },
      ]),
      edges: [],
      // #region collapsed-shapes
      combos: [
        { id: 'circle', collapsed: true },
        { id: 'rect', collapsed: true, style: {
          collapsedType: 'rect', collapsedSize: [120, 48],
          count: (combo) => 'Items: ' + combo.childNodeIds.size,
        } },
        { id: 'label', collapsed: true, style: {
          collapsedType: 'rect', collapsedSize: [120, 48], label: 'Archive',
        } },
      ],
      // #endregion collapsed-shapes
    },
    node: { style: { size: 22 } },
    combo: { style: {
      stroke: '#1783ff', strokeWidth: 2, padding: 24,
      collapsedType: 'circle', collapsedSize: 64, count: true,
    } },
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  graph.on('combo:click', ({ comboId }) => graph.toggleCombo(comboId));
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



### 嵌套分组的可见性 [#嵌套分组的可见性]

折叠父组会隐藏后代节点和关联边，子分组的边框仍可见。展开时，节点或边原有的隐藏状态会保留。

## 动态调整归属 [#动态调整归属]

节点要换组时，调用 `addToCombo(nodeId, comboId)`。分组边框会重新计算。示例点击 Mobile 后，还调用 `updateNodePosition()` 把节点移到新组旁边。



```ts
graph.on('node:click', ({ nodeId }) => {
  if (nodeId !== 'mobile') return;
  const target = graph.getNodeCombo(nodeId) === 'client' ? 'service' : 'client';
  graph.addToCombo(nodeId, target);
  // Membership changes do not move nodes; position this example explicitly.
  graph.updateNodePosition(nodeId, target === 'client' ? 200 : 380, 180);
});
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'web', x: 120, y: 100, comboId: 'client' },
        { id: 'mobile', x: 200, y: 180, comboId: 'client' },
        { id: 'api', x: 460, y: 100, comboId: 'service' },
      ],
      edges: [{ id: 'request', source: 'mobile', target: 'api' }],
      combos: [
        { id: 'client', style: { label: 'Client' } },
        { id: 'service', style: { label: 'Service', stroke: '#f6903d' } },
      ],
    },
    node: { style: {
      size: 24, label: (node) => node.id,
      fill: (node) => node.id === 'mobile' ? '#f6903d' : '#1783ff',
    } },
    combo: { style: { padding: 40, strokeWidth: 2 } },
    behaviors: ['drag-node', 'drag-canvas', 'zoom-canvas'],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  // #region change-membership
  graph.on('node:click', ({ nodeId }) => {
    if (nodeId !== 'mobile') return;
    const target = graph.getNodeCombo(nodeId) === 'client' ? 'service' : 'client';
    graph.addToCombo(nodeId, target);
    // Membership changes do not move nodes; position this example explicitly.
    graph.updateNodePosition(nodeId, target === 'client' ? 200 : 380, 180);
  });
  // #endregion change-membership
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



`removeFromCombo()` 解除节点的分组归属。`createCombo()` 可以用已有节点创建分组，`removeCombo()` 移除分组并保留成员节点。完整签名见[分组方法](/docs/api/graph#graph-combo)。

## 整体拖拽 [#整体拖拽]

分组整体拖动通过 `drag-node` 启用。拖动上方示例的分组空白处，组内节点会一起移动。节点换组时仍通过 `addToCombo()` 或 `removeFromCombo()` 调整归属。

```ts
behaviors: ['drag-node', 'drag-canvas'],
```

## 动态修改分组样式 [#运行时修改边界]

单个分组的样式可以在数据快照中修改，再用 `setData()` 应用。图会重新运行已配置的布局，`fitView: false` 保留当前视图。全局分组样式在创建图时设置。

```ts
const data = graph.getData();
const combo = data.combos?.find(({ id }) => id === 'local');
if (combo) {
  combo.style = { ...combo.style, stroke: '#16a085' };
  await graph.setData(data, { fitView: false });
}
```

## 查询 [#查询]

`getNodeCombo()` 查询节点属于哪个分组。`getComboChildren()` 返回直接成员。`getComboData()` 返回只读的分组模型。

```ts
const groupId = graph.getNodeCombo('mobile');
const members = graph.getComboChildren('client');
const collapsed = graph.getComboData('client')?.collapsed;
```

### ComboModel 字段 [#只读查询模型]

| 字段                             | 含义                  |
| ------------------------------ | ------------------- |
| `id`、`parentId`                | 分组 ID 和上级分组 ID      |
| `childNodeIds`、`childComboIds` | 直接成员节点和直接子分组的 ID 集合 |
| `collapsed`、`states`           | 折叠状态和当前元素状态         |
| `x`、`y`、`width`、`height`       | 展开边框的中心坐标和尺寸        |
| `style`、`data`                 | 单组样式和业务数据           |

### 边框更新与数据导出 [#包围框更新与数据导出]

边框尺寸在渲染时重算。`getData()` 可导出当前成员归属和折叠状态。保存为 JSON 时，样式函数需要单独保存或重建。

## 常见问题 [#常见问题]

### 为什么分组没有边框或标题？ [#为什么分组没有边框或标题]

成员节点要有有效的 `comboId` 和位置。空组不会绘制边框，标题通过 `label` 设置。

### 为什么隐藏或折叠父组后仍有内容？ [#为什么隐藏或折叠父组后仍有内容]

`hidden` 隐藏分组自身。折叠后的成员和子分组可见性见[嵌套分组的可见性](#嵌套分组的可见性)。

### 为什么展开后仍有节点看不到？ [#为什么展开后仍有节点看不到]

检查节点和边的 `hidden` 状态，以及上级分组是否仍处于折叠状态。

### 为什么拖动没有改变归属或选中状态？ [#为什么拖动没有改变归属或选中状态]

拖动负责移动位置。归属通过[分组方法](/docs/api/graph#graph-combo)设置，选中通过[状态方法](/docs/api/graph#graph-states)设置。

### 为什么 updateOptions 不能改 Combo 外观？ [#为什么-updateoptions-不能改-combo-外观]

局部样式通过数据更新。见[动态修改分组样式](#运行时修改边界)。

<span id="options-combo-相关入口" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## 相关 [#相关]

* [分组配置参考](/docs/api/options#options-combo)
* [完整分组示例](/docs/examples/combo)
