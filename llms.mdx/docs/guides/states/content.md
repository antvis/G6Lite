# 元素状态 (/docs/guides/states)





状态用来表达一个元素当前是否选中、高亮，或处于业务标记中。同一元素可以同时有多个状态，例如“已选中 + 待复核”。

## 状态、行为与样式 [#状态行为与样式]

* **状态**记录当前标记，例如 selected。
* **行为**决定何时改变标记，例如 click-select 响应点击。
* **状态样式**决定标记怎样显示，例如 selected 使用紫色描边。

因此，只监听 node:click 不会选中节点；只配置 stateStyles 也不会自动产生交互。可以由 Behavior 修改状态，也可以由业务代码调用状态方法。

## 内置状态类型 [#状态名称与数据]

| 状态          | 含义   | 使用场景                  |
| ----------- | ---- | --------------------- |
| `default`   | 基础外观 | 元素没有状态样式覆盖时           |
| `selected`  | 选中   | 标记用户已选中的节点、边或分组       |
| `active`    | 激活   | 强调正在交互的元素             |
| `highlight` | 高亮   | 突出搜索结果或关联路径           |
| `inactive`  | 弱化   | 淡化与当前操作无关的元素          |
| `disabled`  | 禁用外观 | 显示暂不可用的元素，操作限制由应用逻辑处理 |
| `hidden`    | 隐藏   | 隐去暂时无需展示的元素           |

清空状态即可恢复基础样式。折叠 Combo 造成的隐藏需通过展开恢复。各状态的外观见[元素总览中的对照示例](/docs/elements/overview#元素状态)。

## 配置状态样式 [#状态样式放在哪里]

### 基础配置 [#基础配置]

节点用 `node.stateStyles`，边用 `edge.stateStyles`，分组用 `combo.style.stateStyles`。在 `new Graph()` 的选项中按状态名配置要覆盖的字段，其余字段沿用基础样式或其他已生效的状态样式。

```ts
const stateOptions = {
  node: { stateStyles: { selected: { stroke: '#6d28d9', strokeWidth: 3 } } },
  edge: { stateStyles: { highlight: { stroke: '#008765', lineWidth: 3 } } },
  combo: { style: { stateStyles: { selected: { stroke: '#6d28d9', strokeWidth: 2 } } } },
};
```

### 自定义状态 [#试一试状态变化]

在 `node.stateStyles.review` 中设置 `fill`，就能用橙色标记待复核节点。示例中 A 初始选中。点击 **Toggle review**，A 保留紫色描边并增加橙色填充。点击 **Replace with highlight**，A 切换为绿色高亮。**Clear A** 清空状态。



```ts
const toggle = (state: ElementState) => {
  const enabled = graph.getItemStates('A').includes(state);
  graph.setItemState('A', state, !enabled);
};
const replace = () => graph.setElementStates('A', ['highlight']);
const clear = () => graph.clearItemStates('A');
```

**完整运行代码**

```ts
import { Graph, type ElementState } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0, states: ['selected'] }, { id: 'B', x: 220, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: {
      style: { size: 34, label: (node) => node.id, labelOffsetY: 10 },
      // #region state-styles
      stateStyles: {
        selected: { stroke: '#6D28D9', strokeWidth: 3 },
        review: { fill: '#F59E0B' },
        highlight: { fill: '#00A876', stroke: '#005C41', strokeWidth: 2 },
      },
      // #endregion state-styles
    },
    behaviors: [],
    autoFit: { padding: 60, maxZoom: 1 },
  });
  // #region states
  const toggle = (state: ElementState) => {
    const enabled = graph.getItemStates('A').includes(state);
    graph.setItemState('A', state, !enabled);
  };
  const replace = () => graph.setElementStates('A', ['highlight']);
  const clear = () => graph.clearItemStates('A');
  // #endregion states
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.6 system-ui;pointer-events:none;z-index:20;';
  const update = () => {
    status.textContent = `A: [${graph.getItemStates('A').join(', ')}] | B: [${graph.getItemStates('B').join(', ')}]`;
  };
  const actions: Array<[string, () => void]> = [
    ['Toggle selected', () => toggle('selected')],
    ['Toggle review', () => toggle('review')],
    ['Replace with highlight', replace],
    ['Clear A', clear],
  ];
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    update();
    for (const [label, action] of actions) {
      ui.addAction(label, () => { action(); update(); });
    }
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}


export function createDemoPanel(container: string | HTMLElement, description = '') {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

  let gui: GUI | undefined;
  const getGui = () => {
    if (!gui) {
      gui = new GUI({ container: host, width: 160 });
      gui.domElement.classList.add('g6lite-demo-controls');
      gui.domElement.dataset.captureIgnore = '';
      Object.assign(gui.domElement.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: '30',
        maxWidth: 'calc(100% - 20px)',
        maxHeight: 'calc(100% - 20px)',
      });
    }
    return gui;
  };

  let status: HTMLDivElement | undefined;
  const setStatus = (message: string) => {
    if (!status) {
      status = document.createElement('div');
      status.setAttribute('role', 'status');
      status.dataset.role = 'status';
      status.dataset.captureIgnore = '';
      status.style.cssText =
        'position:absolute;left:12px;bottom:10px;z-index:20;max-width:min(28rem,calc(100% - 24px));color:#64748b;font:12px/1.45 system-ui,sans-serif;pointer-events:none;white-space:pre-wrap;';
      host.append(status);
    }
    status.textContent = message;
  };
  if (description) setStatus(description);

  return {
    get gui() {
      return getGui();
    },
    addAction(label: string, action: () => void, folder = getGui()) {
      return folder.add({ [label]: action }, label);
    },
    addChoice<T extends string>(
      label: string,
      choices: readonly T[] | Record<string, T>,
      value: T,
      onChange: (value: T) => void,
    ) {
      const options = Array.isArray(choices) ? [...choices] : choices;
      return getGui().add({ value }, 'value', options).name(label).onChange(onChange);
    },
    setStatus,
    destroy() {
      gui?.destroy();
      status?.remove();
    },
  };
}
```



节点和边支持通过自定义状态名配置样式。Combo 的样式覆盖使用其支持的内置状态，详见[分组状态样式](/docs/guides/combo#options-combo-状态样式)。

## 设置元素状态 [#设置元素状态]

### 在数据中设置初始状态 [#在数据中设置初始状态]

在节点、边或分组数据的 `states` 数组中声明初始状态。下面的节点 A 初始选中，边 A–B 初始高亮，分组 Storage 初始选中。

```ts
const data = {
  nodes: [
    { id: 'A', x: 0, y: 0, states: ['selected'] },
    { id: 'B', x: 160, y: 0, comboId: 'storage' },
  ],
  edges: [{ id: 'A-B', source: 'A', target: 'B', states: ['highlight'] }],
  combos: [{ id: 'storage', states: ['selected'] }],
};
```

### 动态设置状态 [#增减业务标记保留已有选择]

首次 `await graph.render()` 完成后，用 `setItemState()` 添加单个状态并保留其余状态。用 `setElementStates()` 替换指定元素的全部状态。

```ts
graph.setItemState('A', 'review', true);
graph.setElementStates('A', ['selected', 'review']);
graph.setElementStates({ A: ['selected'], 'A-B': ['highlight'], storage: ['selected'] });
```

### 批量增减状态 [#批量更新与-combo]

用 `batchSetState()` 在一次更新中修改多个元素的指定状态，其余状态会保留。

```ts
graph.batchSetState([
  { id: 'A', state: 'review', value: true },
  { id: 'A-B', state: 'highlight', value: true },
  { id: 'storage', state: 'selected', value: true },
]);
```

### 状态的叠加效果 [#状态的叠加效果]

节点和边按状态集合顺序合并样式。同一字段由多个状态覆盖时，后面的状态生效。例如，`['selected', 'review']` 可以同时应用选中描边和待复核填充。Combo 按 `active → highlight → selected → disabled → inactive` 的固定顺序合并样式。详见[节点](/docs/guides/node#options-node-状态样式)、[边](/docs/guides/edge#options-edge-状态样式)和[分组](/docs/guides/combo#options-combo-状态样式)的配置说明。

### 点击选择与悬停高亮一起使用 [#点击选择与悬停高亮一起使用]

下面的示例用 `click-select` 管理选择，用 `hover-highlight` 高亮关联元素。点击选择使用紫色描边，悬停高亮使用绿色。长期业务标记可使用 `review` 等自定义状态。界面同步见[选择结果监听](/docs/guides/events/selection-drag#同步选择结果)。

### 替换数据时保留选择 [#替换数据时保留选择]

先点 A，再按住 Shift 依次点击 B 和横向的 A–C 边。点击 **Keep selected** 后，A 和 A–C 仍选中，B 随旧数据移除，新增的 D 保持基础外观。重置后重新选择，再点击 **Reload data**，可对比直接替换数据的效果。



```ts
const reload = async (keepSelected: boolean) => {
  const nodes = new Set(keepSelected ? graph.findNodesByState('selected') : []);
  const edges = new Set(keepSelected ? graph.findEdgesByState('selected') : []);
  const next = nextData();
  await graph.setData({
    ...next,
    nodes: next.nodes.map((node) => ({
      ...node, states: nodes.has(node.id) ? ['selected'] : [],
    })),
    edges: next.edges.map((edge) => ({
      ...edge, states: edge.id && edges.has(edge.id) ? ['selected'] : [],
    })),
  }, { fitView: false });
};
```

**完整运行代码**

```ts
import { Graph, type GraphData } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 160, y: 80 }, { id: 'C', x: 320, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }, { id: 'A-C', source: 'A', target: 'C' }],
    },
    node: {
      style: { size: 32, label: (node) => node.id, labelOffsetY: 10 },
      stateStyles: {
        selected: { stroke: '#6D28D9', strokeWidth: 3 },
        highlight: { fill: '#00A876' },
      },
    },
    edge: {
      style: { hitAreaWidth: 12 },
      stateStyles: {
        selected: { stroke: '#6D28D9', lineWidth: 3 },
        highlight: { stroke: '#00A876', lineWidth: 2 },
      },
    },
    behaviors: [
      { type: 'click-select', multiple: true, trigger: 'shift' },
      { type: 'hover-highlight', degree: 1 },
    ],
    autoFit: { padding: 60, maxZoom: 1 },
  });
  const nextData = (): GraphData => ({
    nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'C', x: 320, y: 0 }, { id: 'D', x: 160, y: 80 }],
    edges: [{ id: 'A-C', source: 'A', target: 'C' }, { id: 'C-D', source: 'C', target: 'D' }],
  });
  // #region preserve-selection
  const reload = async (keepSelected: boolean) => {
    const nodes = new Set(keepSelected ? graph.findNodesByState('selected') : []);
    const edges = new Set(keepSelected ? graph.findEdgesByState('selected') : []);
    const next = nextData();
    await graph.setData({
      ...next,
      nodes: next.nodes.map((node) => ({
        ...node, states: nodes.has(node.id) ? ['selected'] : [],
      })),
      edges: next.edges.map((edge) => ({
        ...edge, states: edge.id && edges.has(edge.id) ? ['selected'] : [],
      })),
    }, { fitView: false });
  };
  // #endregion preserve-selection
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.6 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  let version = 1;
  let disposed = false;
  const update = () => {
    status.textContent = `data v${version} | selected nodes: ${graph.findNodesByState('selected').join(', ') || 'none'}\nselected edges: ${graph.findEdgesByState('selected').join(', ') || 'none'}`;
  };
  const events = ['node:selectchange', 'edge:selectchange', 'selection:clear'] as const;
  for (const event of events) graph.on(event, update);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    for (const event of events) graph.off(event, update);
    ui.destroy();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    update();
    const buttons = [false, true].map((keep) => ui.addAction(keep ? 'Keep selected' : 'Reload data', async () => {
        for (const item of buttons) item.disable();
        try {
          await reload(keep);
          if (!disposed) { version++; update(); }
        } catch {
          if (!disposed) status.textContent = 'Reload failed';
        } finally {
          if (!disposed) for (const item of buttons) item.enable();
        }
    }));
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}


export function createDemoPanel(container: string | HTMLElement, description = '') {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

  let gui: GUI | undefined;
  const getGui = () => {
    if (!gui) {
      gui = new GUI({ container: host, width: 160 });
      gui.domElement.classList.add('g6lite-demo-controls');
      gui.domElement.dataset.captureIgnore = '';
      Object.assign(gui.domElement.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: '30',
        maxWidth: 'calc(100% - 20px)',
        maxHeight: 'calc(100% - 20px)',
      });
    }
    return gui;
  };

  let status: HTMLDivElement | undefined;
  const setStatus = (message: string) => {
    if (!status) {
      status = document.createElement('div');
      status.setAttribute('role', 'status');
      status.dataset.role = 'status';
      status.dataset.captureIgnore = '';
      status.style.cssText =
        'position:absolute;left:12px;bottom:10px;z-index:20;max-width:min(28rem,calc(100% - 24px));color:#64748b;font:12px/1.45 system-ui,sans-serif;pointer-events:none;white-space:pre-wrap;';
      host.append(status);
    }
    status.textContent = message;
  };
  if (description) setStatus(description);

  return {
    get gui() {
      return getGui();
    },
    addAction(label: string, action: () => void, folder = getGui()) {
      return folder.add({ [label]: action }, label);
    },
    addChoice<T extends string>(
      label: string,
      choices: readonly T[] | Record<string, T>,
      value: T,
      onChange: (value: T) => void,
    ) {
      const options = Array.isArray(choices) ? [...choices] : choices;
      return getGui().add({ value }, 'value', options).name(label).onChange(onChange);
    },
    setStatus,
    destroy() {
      gui?.destroy();
      status?.remove();
    },
  };
}
```



在 `setData()` 前分别查询已选节点和边的 ID，匹配到新数据后写入 `states`。边需要稳定的显式 ID。示例仅恢复 `selected`，并用 `fitView: false` 保留相机视野。

## 清除元素状态 [#清除元素状态]

### 清除全部状态 [#清除全部状态]

用 `clearItemStates()` 清空一个元素的状态。批量清空时，给每个元素传入空数组。

```ts
graph.clearItemStates('A');
graph.setElementStates({ A: [], 'A-B': [], storage: [] });
```

### 清除指定状态 [#清除指定状态]

把 `setItemState()` 的第三个参数设为 `false`，即可只移除该状态。例如，移除 `review` 后仍保留 A 的选中状态。

```ts
graph.setItemState('A', 'review', false);
```

### 批量清除同一状态 [#批量清除同一状态]

先找出带高亮状态的边，再用 `batchSetState()` 清除它们的高亮。

```ts
graph.batchSetState(
  graph.findEdgesByState('highlight').map((id) => ({ id, state: 'highlight', value: false })),
);
```

## 查询元素状态 [#查询元素状态]

### 获取元素状态和判断某个状态 [#获取元素状态和判断某个状态]

`getItemStates()` 返回一个节点、边或分组的状态数组。没有状态时返回空数组。用 `includes()` 判断元素是否处于某个状态。

```ts
const states = graph.getItemStates('A');
const isSelected = states.includes('selected');
```

### 查找处于指定状态的元素 [#查找处于指定状态的元素]

按节点、边或分组查询，返回匹配的元素 ID。

```ts
const selectedNodeIds = graph.findNodesByState('selected');
const highlightedEdgeIds = graph.findEdgesByState('highlight');
const selectedComboIds = graph.findCombosByState('selected');
```

## 常见问题 [#常见问题]

### 加了状态，为什么外观没变？ [#加了状态为什么外观没变]

检查是否为该状态配置了支持的样式字段。节点 style 使用整对象函数时，当前实现不应用 stateStyles；需要状态外观时使用逐字段配置，见[节点样式函数](/docs/guides/node#样式函数)。

### 设置 selected，为什么没有选择事件？ [#设置-selected为什么没有选择事件]

程序修改状态不会补发 node:selectchange。该事件由 click-select 发出；业务同步应在程序更新后主动执行，见[选择同步](/docs/guides/events/selection-drag#同步选择结果)。

### 清空状态，为什么元素还是隐藏？ [#清空状态为什么元素还是隐藏]

检查元素是否位于折叠 Combo 内。展开结构性分组后，再检查业务 hidden 状态。

### 清理高亮后，为什么选中也没了？ [#清理高亮后为什么选中也没了]

检查是否调用了 clearItemStates 或用不含 selected 的集合替换全部状态。只移除自己负责的状态，其他状态会保留。

### 保留选择后，为什么有的元素没恢复？ [#保留选择后为什么有的元素没恢复]

先检查新数据是否仍有对应 ID，边 ID 是否稳定。示例刻意丢弃已删除的元素，并且只保留 selected。

### 修改状态后还要重新 render 吗？ [#修改状态后还要重新-render-吗]

不用。初始化完成后的状态方法会安排绘制；业务 UI 通过查询或自己的同步逻辑更新。

继续查询：[状态与显隐方法](/docs/api/graph#graph-states) · [节点状态样式](/docs/guides/node#options-node-状态样式) · [边状态样式](/docs/guides/edge#options-edge-状态样式) · [交互组合](/docs/guides/behaviors)。

**相关可运行示例**

* [点选、框选与拉索选择](/docs/examples/selection-behaviors)
