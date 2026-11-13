# 边通用配置项 (/docs/guides/edge)





用 `GraphOptions.edge` 选择路径，设置线条、箭头和标签。端点、方向与数据结构见[边总览](/docs/elements/edge)。

<span id="基础配置" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## EdgeConfig [#edgeconfig]

`EdgeConfig` 对应 `new Graph()` 的 `edge` 选项。下例绘制一条蓝色直线，终点带箭头，选中后改用紫色。

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: '#container',
  data: {
    nodes: [{ id: 'a', x: 80, y: 100 }, { id: 'b', x: 260, y: 100 }],
    edges: [{ id: 'a-b', source: 'a', target: 'b' }],
  },
  edge: {
    type: 'line',
    style: { stroke: '#1783FF', lineWidth: 2, endArrow: true },
    stateStyles: { selected: { stroke: '#7C3AED', lineWidth: 4 } },
  },
  behaviors: ['click-select'],
});

await graph.render();
```

| 属性                                      | 描述               | 类型                                                   | 默认值       | 必选 |
| --------------------------------------- | ---------------- | ---------------------------------------------------- | --------- | -- |
| [`type`](#类型)                           | 内置边类型或已注册的自定义边名称 | `string`                                             | `'line'`  | 否  |
| [`style`](#样式字段)                        | 线条、路径参数、箭头和标签    | `EdgeConfig['style']`                                | 主题和内置样式   | 否  |
| [`stateStyles`](#状态样式)                  | 按状态覆盖外观          | `Partial<Record<EdgeState, EdgeStateStyleOverride>>` | 扩展或主题状态样式 | 否  |
| [`parallelEdges`](#平行边与自环)              | 分离同端点的多条边        | `boolean \| ParallelEdgesConfig`                     | 关闭        | 否  |
| [`labelRenderer`](#edge-label-renderer) | 已注册的标签渲染器        | `string`                                             | 内置标签渲染器   | 否  |

## 指定边类型 [#类型]

用 `edge.type` 指定边类型，默认是 `line`（直线边）。下面将整张图的边设为 `polyline`（折线边）。

```ts
const graph = new Graph({
  container,
  data,
  edge: { type: 'polyline' },
});
```

| 类型值        | 名称                      | 适用场景              |
| ---------- | ----------------------- | ----------------- |
| `line`     | [直线边](#edge-line)       | 直接连接两个端点          |
| `arc`      | [弧线边](#edge-arc)        | 调整弯曲方向，或分开同端点的多条边 |
| `cubic`    | [三次贝塞尔曲线边](#edge-cubic) | 平滑连接左右层级          |
| `polyline` | [折线边](#edge-polyline)   | 流程图、目录树或鱼骨图中的路由连接 |

自定义类型先[注册边扩展](/docs/guides/custom-edge)，再把 `edge.type` 设为注册名称。

### 直线边 Line [#edge-line]

`line` 直接连接两个端点。`endArrow: true` 在终点加箭头。

```ts
const edge = { type: 'line', style: { lineWidth: 2, endArrow: true } };
```

### 弧线与三次曲线 [#弧线与三次曲线]

#### 弧线边 Arc [#edge-arc]

`curvature` 控制弧线方向和弯曲程度。示例对比 `-0.35`、`0` 和 `0.35`。



```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const rows = [
    { id: 'curvature -0.35', y: 60, curvature: -0.35 },
    { id: 'curvature 0', y: 150, curvature: 0 },
    { id: 'curvature 0.35', y: 240, curvature: 0.35 },
  ];
  const graph = new Graph({
    container,
    data: {
      nodes: rows.flatMap((row) => [
        { id: row.id + '-s', x: 100, y: row.y, data: { label: row.id } },
        { id: row.id + '-t', x: 440, y: row.y },
      ]),
      edges: rows.map((row) => ({ id: row.id, source: row.id + '-s', target: row.id + '-t', data: row })),
    },
    node: { style: { size: 20, label: (node) => String(node.data?.label ?? '') } },
    edge: {
      type: 'arc',
      style: { curvature: (_s, _t, edge) => Number(edge.data?.curvature ?? 0), lineWidth: 2, hitAreaWidth: 12 },
      stateStyles: { selected: { stroke: '#873bf4' } },
    },
    behaviors: ['click-select'],
    autoFit: { padding: 48, maxZoom: 1 },
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



#### 三次曲线边 Cubic [#edge-cubic]

`curveOffset` 控制三次曲线两端的水平控制柄。示例对比 `30` 和 `120`。两端等高时，边可能仍呈直线。



```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const rows = [{ id: 'offset 30', y: 40, offset: 30 }, { id: 'offset 120', y: 180, offset: 120 }];
  const graph = new Graph({
    container,
    data: {
      nodes: rows.flatMap((row) => [
        { id: row.id + '-s', x: 100, y: row.y, data: { label: row.id } },
        { id: row.id + '-t', x: 440, y: row.y + 80 },
      ]),
      edges: rows.map((row) => ({ id: row.id, source: row.id + '-s', target: row.id + '-t', data: row })),
    },
    node: { type: 'rect', style: { width: 70, height: 28, label: (node) => String(node.data?.label ?? '') } },
    edge: {
      type: 'cubic',
      style: { curveOffset: (_s, _t, edge) => Number(edge.data?.offset ?? 60), lineWidth: 2, hitAreaWidth: 12 },
      stateStyles: { selected: { stroke: '#873bf4' } },
    },
    behaviors: ['click-select'],
    autoFit: { padding: 48, maxZoom: 1 },
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



<span id="基础样式" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="edge-style-fields" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## Style 边样式 [#样式字段]

### 主图形样式 [#edge-path-styles]

线条样式控制边的颜色、粗细、透明度和方向。

| 字段             | 类型                         | 默认或回退                                                     | 说明                                    |
| -------------- | -------------------------- | --------------------------------------------------------- | ------------------------------------- |
| `stroke`       | `EdgeStyleValue<string>`   | `theme.edgeStroke`；light 为 `'#99ADD1'`，dark 为 `'#637088'` | 边和箭头颜色                                |
| `lineWidth`    | `EdgeStyleValue<number>`   | `theme.edgeLineWidth`，预设为 `1`                             | 视觉线宽，使用有限正数                           |
| `opacity`      | `EdgeStyleValue<number>`   | `1`                                                       | 不透明度，使用 `0` 到 `1`                     |
| `lineDash`     | `EdgeStyleValue<number[]>` | `[]`                                                      | 空数组为实线；当前按前两个值之和计算虚线周期，见[虚线规则](#虚线规则) |
| `startArrow`   | `EdgeStyleValue<boolean>`  | `false`                                                   | 起点箭头，指向 `source`                      |
| `endArrow`     | `EdgeStyleValue<boolean>`  | `theme.edgeArrow`，light、dark 均为 `true`                    | 终点箭头，指向 `target`                      |
| `arrowSize`    | `EdgeStyleValue<number>`   | 根据线宽自动计算                                                  | 箭头沿路径方向的长度；显式长度使用有限正数，非正值使用自动长度       |
| `hitAreaWidth` | `EdgeStyleValue<number>`   | 最终 `lineWidth`                                            | 总点击热区宽度，不改变视觉线宽，见[交互热区](#交互热区)        |

线宽、热区宽度、箭头长度和虚线周期使用屏幕渲染像素，随缩放保持大小。

<span id="样式回调" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### 样式函数 [#样式函数]

样式函数接收 `(source, target, edge)`，可根据每条边的数据计算样式。示例按 `edge.data` 画出细实线、虚线和双向箭头。



```ts
edge: {
  type: 'line',
  style: {
    stroke: (_source, _target, edge) => String(edge.data?.color ?? '#99ADD1'),
    lineWidth: (_source, _target, edge) => Number(edge.data?.width ?? 1),
    lineDash: (_source, _target, edge) => (edge.data?.dash as number[]) ?? [],
    opacity: (_source, _target, edge) => Number(edge.data?.opacity ?? 1),
    startArrow: (_source, _target, edge) => edge.data?.start === true,
    endArrow: (_source, _target, edge) => edge.data?.end === true,
    arrowSize: 16,
    hitAreaWidth: 14,
  },
  stateStyles: { selected: { stroke: '#873bf4', lineWidth: 6 } },
},
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const rows = [
    { id: 'Plain', y: 60, width: 1.5, color: '#64748b', dash: [], start: false, end: false, opacity: 1 },
    { id: 'Dash', y: 150, width: 3, color: '#f6903d', dash: [8, 8], start: false, end: true, opacity: 0.7 },
    { id: 'Both', y: 240, width: 5, color: '#1783FF', dash: [], start: true, end: true, opacity: 1 },
  ];
  const graph = new Graph({
    container,
    data: {
      nodes: rows.flatMap((row) => [
        { id: `${row.id}-source`, x: 100, y: row.y, data: { label: row.id } },
        { id: `${row.id}-target`, x: 440, y: row.y },
      ]),
      edges: rows.map((row) => ({
        id: row.id, source: `${row.id}-source`, target: `${row.id}-target`, data: row,
      })),
    },
    node: { style: { size: 20, label: (node) => String(node.data?.label ?? '') } },
    // #region edge-options
    edge: {
      type: 'line',
      style: {
        stroke: (_source, _target, edge) => String(edge.data?.color ?? '#99ADD1'),
        lineWidth: (_source, _target, edge) => Number(edge.data?.width ?? 1),
        lineDash: (_source, _target, edge) => (edge.data?.dash as number[]) ?? [],
        opacity: (_source, _target, edge) => Number(edge.data?.opacity ?? 1),
        startArrow: (_source, _target, edge) => edge.data?.start === true,
        endArrow: (_source, _target, edge) => edge.data?.end === true,
        arrowSize: 16,
        hitAreaWidth: 14,
      },
      stateStyles: { selected: { stroke: '#873bf4', lineWidth: 6 } },
    },
    // #endregion edge-options
    behaviors: ['click-select'],
    autoFit: { padding: 48, maxZoom: 1 },
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



### 虚线规则 [#虚线规则]

用 `lineDash` 绘制虚线，前两个数相加决定虚线周期。直线示例将 `lineWidth` 设为 `3`，对比实线和两种虚线间距。



```ts
const rows = [
  { id: 'Solid', y: 0, dash: [] },
  { id: 'Short dashes', y: 75, dash: [4, 4] },
  { id: 'Long dashes', y: 150, dash: [8, 8] },
];
const edge: EdgeConfig = {
  type: 'line',
  style: {
    lineWidth: 3,
    endArrow: false,
    lineDash: (_source, _target, edge) => (edge.data?.dash as number[] | undefined) ?? [],
  },
};
```

**完整运行代码**

```ts
import { Graph, type EdgeConfig } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region dash-options
  const rows = [
    { id: 'Solid', y: 0, dash: [] },
    { id: 'Short dashes', y: 75, dash: [4, 4] },
    { id: 'Long dashes', y: 150, dash: [8, 8] },
  ];
  const edge: EdgeConfig = {
    type: 'line',
    style: {
      lineWidth: 3,
      endArrow: false,
      lineDash: (_source, _target, edge) => (edge.data?.dash as number[] | undefined) ?? [],
    },
  };
  // #endregion dash-options
  const graph = new Graph({
    container,
    data: {
      nodes: rows.flatMap(({ id, y }) => [
        { id: id + '-source', x: 0, y },
        { id: id + '-target', x: 320, y },
      ]),
      edges: rows.map(({ id, dash }) => ({
        id,
        source: id + '-source',
        target: id + '-target',
        data: { dash },
      })),
    },
    node: { style: { size: 16 } },
    edge: {
      ...edge,
      style: { ...edge.style, label: (_source, _target, edge) => edge.id ?? '', labelFontSize: 12 },
    },
    autoFit: { padding: 48, maxZoom: 1 },
    behaviors: [],
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





### 箭头 [#箭头]

用 `startArrow` 和 `endArrow` 控制两端箭头，用 `arrowSize` 设置长度。



```ts
edge: {
  type: 'line',
  style: {
    stroke: '#99ADD1',
    lineWidth: (_source, _target, edge) => Number(edge.data?.lw ?? 2),
    endArrow: (_source, _target, edge) => edge.data?.dir !== 'none',
    startArrow: (_source, _target, edge) => edge.data?.dir === 'both',
  },
},
```

**完整运行代码**

```ts
/**
 * Demo: Arrow directions - none / forward / bidirectional
 */
import { Graph } from '@antv/g6-lite';

export async function runGraph(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'n1', name: 'No arrow', x: 80, y: 120 },
        { id: 't1', name: '', x: 280, y: 120 },
        { id: 'n2', name: 'Forward', x: 400, y: 120 },
        { id: 't2', name: '', x: 600, y: 120 },
        { id: 'n3', name: 'Bidirectional', x: 80, y: 280 },
        { id: 't3', name: '', x: 280, y: 280 },
        { id: 'n4', name: 'Thick + arrow', x: 400, y: 280 },
        { id: 't4', name: '', x: 600, y: 280 },
      ],
      edges: [
        { source: 'n1', target: 't1', data: { dir: 'none' } },
        { source: 'n2', target: 't2', data: { dir: 'forward' } },
        { source: 'n3', target: 't3', data: { dir: 'both' } },
        { source: 'n4', target: 't4', data: { dir: 'forward', lw: 6 } },
      ],
    },
    node: { type: 'circle', style: { fill: '#5B8FF9', size: 24, label: (node) => node.name ?? '' } },
    // #region arrow-options
    edge: {
      type: 'line',
      style: {
        stroke: '#99ADD1',
        lineWidth: (_source, _target, edge) => Number(edge.data?.lw ?? 2),
        endArrow: (_source, _target, edge) => edge.data?.dir !== 'none',
        startArrow: (_source, _target, edge) => edge.data?.dir === 'both',
      },
    },
    // #endregion arrow-options
    theme: 'light',
  });

  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}

export async function run(container: string | HTMLElement) {
  const graph = await runGraph(container);
  return {
    getData: () => graph.getData(),
    fitView: () => graph.fitView({ padding: 64 }),
    destroy: () => graph.destroy(),
  };
}
```



[箭头尺寸与默认值](/docs/api/options#config-edge-style)

<span id="点击热区" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="细边交互热区" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## 交互热区 [#交互热区]

用 `hitAreaWidth` 扩大边的命中范围，同时保持原线宽。示例用 `click-select` 启用点击选中。



```ts
edge: {
  type: 'line',
  style: {
    stroke: '#64748b',
    lineWidth: 1.5,
    endArrow: false,
    hitAreaWidth: (_source, _target, edge) => edge.id === 'wide' ? 24 : 2,
  },
  stateStyles: { selected: { stroke: '#873bf4' } },
},
behaviors: ['click-select'],
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'narrow-source', x: 100, y: 80, data: { label: 'Width 2' } },
        { id: 'narrow-target', x: 440, y: 80 },
        { id: 'wide-source', x: 100, y: 200, data: { label: 'Width 24' } },
        { id: 'wide-target', x: 440, y: 200 },
      ],
      edges: [
        { id: 'narrow', source: 'narrow-source', target: 'narrow-target' },
        { id: 'wide', source: 'wide-source', target: 'wide-target' },
      ],
    },
    node: { style: { size: 20, label: (node) => String(node.data?.label ?? '') } },
    // #region hit-area
    edge: {
      type: 'line',
      style: {
        stroke: '#64748b',
        lineWidth: 1.5,
        endArrow: false,
        hitAreaWidth: (_source, _target, edge) => edge.id === 'wide' ? 24 : 2,
      },
      stateStyles: { selected: { stroke: '#873bf4' } },
    },
    behaviors: ['click-select'],
    // #endregion hit-area
    autoFit: { padding: 48, maxZoom: 1 },
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





<span id="options-edge-状态样式" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## 状态样式 [#状态样式]

用 [`edge.stateStyles`](/docs/api/options#config-edge-state-style) 设置不同状态的外观。点击边查看紫色选中样式。



```ts
edge: {
  style: { stroke: '#64748B', lineWidth: 2, hitAreaWidth: 14 },
  stateStyles: {
    selected: { stroke: '#7C3AED', lineWidth: 5 },
  },
},
behaviors: ['click-select'],
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'api', x: 0, y: 0 },
        { id: 'db', x: 200, y: -55 },
        { id: 'cache', x: 200, y: 55 },
      ],
      edges: [
        { id: 'api-db', source: 'api', target: 'db', states: ['selected'] },
        { id: 'api-cache', source: 'api', target: 'cache' },
      ],
    },
    node: { style: { size: 20 } },
    // #region state-styles
    edge: {
      style: { stroke: '#64748B', lineWidth: 2, hitAreaWidth: 14 },
      stateStyles: {
        selected: { stroke: '#7C3AED', lineWidth: 5 },
      },
    },
    behaviors: ['click-select'],
    // #endregion state-styles
    autoFit: { padding: 48, maxZoom: 1 },
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



<span id="parallel-edges" style="{ scrollMarginTop: '8rem' }" />

## 平行边与自环 [#平行边与自环]

同一对节点的多条关系用平行边分离。自环是起点和终点相同的边，可独立配置。

### 分离同向与反向边 [#分离同向与反向边]

用 `edge.parallelEdges` 分开同一对节点之间重叠的边。上排有三条 A→B 的同向边和一条 B→B 的紫色自环，下排是一对反向边。



```ts
const selfLoop = { id: 'bb', source: 'B', target: 'B' };
const parallelEdges = { enabled: true, offset: 48, includeReverse: true, maxOffset: 100 };
const edge: EdgeConfig = {
  type: 'line',
  parallelEdges,
  style: {
    endArrow: true,
    lineWidth: 2,
    stroke: (_source, _target, edge) => {
      if (edge.source === edge.target) return '#7c3aed';
      return edge.source === 'D' ? '#f6903d' : '#1783ff';
    },
  },
};
```

**完整运行代码**

```ts
import { Graph, type EdgeConfig } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  // #region separation
  const selfLoop = { id: 'bb', source: 'B', target: 'B' };
  const parallelEdges = { enabled: true, offset: 48, includeReverse: true, maxOffset: 100 };
  const edge: EdgeConfig = {
    type: 'line',
    parallelEdges,
    style: {
      endArrow: true,
      lineWidth: 2,
      stroke: (_source, _target, edge) => {
        if (edge.source === edge.target) return '#7c3aed';
        return edge.source === 'D' ? '#f6903d' : '#1783ff';
      },
    },
  };
  // #endregion separation
  let { enabled, offset, includeReverse } = parallelEdges;
  const options = () => ({ ...parallelEdges, enabled, offset, includeReverse });
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 0, y: 0 }, { id: 'B', x: 260, y: 0 },
        { id: 'C', x: 0, y: 150 }, { id: 'D', x: 260, y: 150 },
      ],
      edges: [
        { id: 'ab1', source: 'A', target: 'B' },
        { id: 'ab2', source: 'A', target: 'B' },
        { id: 'ab3', source: 'A', target: 'B' },
        selfLoop,
        { id: 'cd', source: 'C', target: 'D' },
        { id: 'dc', source: 'D', target: 'C' },
      ],
    },
    node: { style: { size: 26, label: (node) => node.id, labelPlacement: 'bottom' } },
    edge,
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
    autoFit: { padding: [90, 64, 64, 64], maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:10px;background:#fff;color:#334155;padding:4px 8px;font:12px system-ui;pointer-events:none;';
  const applySeparationOptions = () => {
    // #region update
    graph.updateOptions({ edge: { parallelEdges: options() } });
    // #endregion update
  };
  const updateStatus = () => {
    status.textContent = `enabled: ${enabled} · offset: ${offset} · includeReverse: ${includeReverse} · A→B: ${graph.getEdges().filter((edge) => edge.source === 'A').length}`;
  };
  const actions: Array<[string, () => void]> = [
    ['Toggle separation', () => {
      enabled = !enabled;
      applySeparationOptions();
    }],
    ['Spacing 24 / 64', () => {
      offset = offset === 24 ? 64 : 24;
      applySeparationOptions();
    }],
    ['Toggle reverse group', () => {
      includeReverse = !includeReverse;
      applySeparationOptions();
    }],
    // #region mutation
    ['Add ab4', () => { if (!graph.getEdgeData('ab4')) graph.addEdge({ id: 'ab4', source: 'A', target: 'B' }); }],
    ['Remove ab4', () => { graph.removeEdge('ab4'); }],
    // #endregion mutation
  ];
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy(); status.remove(); destroy();
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    for (const [label, action] of actions) {
      ui.addAction(label, () => { action(); updateStatus(); });
    }
    container.append(status);
    updateStatus();
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



### 调整平行边的间距和分组 [#分组与间距]

在 `new Graph()` 中通过 `edge.parallelEdges` 开启分离并设置参数。此配置适用于 `line` 和 `arc`。

```ts
const graph = new Graph({
  container,
  data,
  edge: {
    type: 'line',
    parallelEdges: { enabled: true, offset: 48, includeReverse: true },
  },
});
```

* **间距**。点击上方 **Spacing 24 / 64**，对比 A→B 的三条边。`offset` 从 `24` 增至 `64` 时，外侧两条边弯得更开。
* **分组**。`includeReverse: true` 将 C→D 和 D→C 放在同一组，两条边会分开。点击 **Toggle reverse group** 设为 `false` 后，它们各自成组，在示例里会重叠。

图渲染后，可以用 `updateOptions()` 改间距。它会替换整个 `parallelEdges` 对象，因此要带上继续使用的设置。

```ts
graph.updateOptions({
  edge: { parallelEdges: { enabled: true, offset: 64, includeReverse: true } },
});
```

偏移单位、上限和分组规则见 [ParallelEdgesConfig](/docs/api/options#config-parallel-edge-fields)。

### 在 transforms 中配置平行边 [#两种入口与优先级]

如果项目把数据处理集中配置在 `transforms` 中，也可以在这里开启平行边分离。两种写法选一种即可。

```ts
const graph = new Graph({
  container,
  data,
  transforms: [
    { type: 'process-parallel-edges', options: { offset: 24 } },
  ],
});
```

如果两处设置了同一个选项，以 `edge.parallelEdges` 为准。例如，两处分别设置 `offset: 48` 和 `offset: 24`，最终使用 `48`。将 `edge.parallelEdges` 设为 `false` 可关闭分离。

### 添加或删除平行边 [#增删边后更新]

开启平行边分离后，添加或删除一条边，图会按新的边数自动重新排列同组的边。点击上方 **Add ab4**，A→B 从三条变成四条，原有的边也会挪动。

```ts
graph.addEdge({ id: 'ab4', source: 'A', target: 'B' });
```

点击 **Remove ab4** 删除刚加的边，A→B 恢复三条。

```ts
graph.removeEdge('ab4');
```

### 自环与标签 [#自环与标签]

让 `source` 与 `target` 指向同一节点即可画出自环。拖动节点，观察环和标签一起移动。



```ts
data: {
  nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 220, y: 0 }],
  edges: [
    { id: 'a1', source: 'A', target: 'A' },
    { id: 'b1', source: 'B', target: 'B' },
    { id: 'b2', source: 'B', target: 'B' },
    { id: 'b3', source: 'B', target: 'B' },
  ],
},
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    // #region loops
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 220, y: 0 }],
      edges: [
        { id: 'a1', source: 'A', target: 'A' },
        { id: 'b1', source: 'B', target: 'B' },
        { id: 'b2', source: 'B', target: 'B' },
        { id: 'b3', source: 'B', target: 'B' },
      ],
    },
    // #endregion loops
    node: { style: { size: 32, label: (node) => node.id, labelPlacement: 'bottom' } },
    edge: {
      type: 'line',
      parallelEdges: false,
      style: {
        endArrow: true, stroke: '#7c3aed', lineWidth: 2,
        label: (_source, _target, edge) => edge.id ?? '',
        labelBackground: '#fff', labelBackgroundPadding: 3,
      },
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'click-select'],
    autoFit: { padding: 64, maxZoom: 1 },
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



自环的大小和层级由渲染器决定，`parallelEdges` 的间距仅用于不同端点之间的边。

<span id="polyline-routing" style="{ scrollMarginTop: '8rem' }" />

<span id="曲线与折线路由" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="edge-polyline" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## 折线路由 [#折线路由]

用 `edge.type: 'polyline'` 启用折线，再用 `router` 选择路径。字段和默认值见 [EdgeConfig.style](/docs/api/options#config-edge-style)。

<span id="路由选择" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### 选择路由 [#选择路由]

| 路由         | 适用场景                          |
| ---------- | ----------------------------- |
| `orth`     | 流程图。用横纵线段连接两端，可用 `radius` 加圆角 |
| `tree`     | 层级图。同源边分配端口，以平滑曲线连接           |
| `indented` | 目录树。父节点主干连接各子项                |
| `fishbone` | 鱼骨图。与 `fishbone` 布局配合使用       |

### 正交连接与圆角 [#正交连接与圆角]

折线由横线和竖线组成。示例里的 **Radius** 设为 `0` 时是直角，设为 `16` 时是圆角。



```ts
const layout = {
  type: 'dagre', rankdir: 'LR',
  nodesep: 40, ranksep: 96, nodeSize: [84, 32],
} satisfies LayoutConfig;
const edge: EdgeConfig = {
  type: 'polyline',
  style: { router: 'orth', radius: 16, endArrow: true, lineWidth: 2 },
};
```

**完整运行代码**

```ts
import { Graph, type EdgeConfig, type LayoutConfig } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  // #region routing
  const layout = {
    type: 'dagre', rankdir: 'LR',
    nodesep: 40, ranksep: 96, nodeSize: [84, 32],
  } satisfies LayoutConfig;
  const edge: EdgeConfig = {
    type: 'polyline',
    style: { router: 'orth', radius: 16, endArrow: true, lineWidth: 2 },
  };
  // #endregion routing
  const graph = new Graph({
    container,
    data: {
      nodes: ['A', 'B', 'C', 'D'].map((id) => ({ id })),
      edges: [
        { id: 'A-B', source: 'A', target: 'B' },
        { id: 'A-C', source: 'A', target: 'C' },
        { id: 'B-D', source: 'B', target: 'D' },
        { id: 'C-D', source: 'C', target: 'D' },
      ],
    },
    node: {
      type: 'rect',
      style: { width: 84, height: 32, borderRadius: 5, label: (node) => node.id, labelPlacement: 'center', labelColor: '#fff' },
    },
    layout,
    edge,
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 48, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); destroy(); };
  try {
    await graph.render();
    ui.addChoice('Radius', ['0', '16'], '16', (value) => {
      const radius = Number(value);
      // #region rounding
      graph.updateOptions({ edge: { style: { radius } } });
      // #endregion rounding
    });
    ui.addChoice<'LR' | 'TB'>('Direction', ['LR', 'TB'], 'LR', async (rankdir) => {
      try {
        graph.setLayout({ ...layout, rankdir });
        await graph.render();
      } catch {
        if (!graph.destroyed) ui.setStatus('Layout failed');
      }
    });
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



### 目录树的缩进连接 [#目录树的缩进连接]

子节点像文件目录一样逐级向右缩进，同一个父节点下的子节点共用一条竖线。



```ts
layout: { type: 'indented', direction: 'LR', indent: 160, rowHeight: 70 },
edge: {
  type: 'polyline',
  style: { router: 'indented', indentTarget: 'left', radius: 10, lineWidth: 2, hitAreaWidth: 12 },
  stateStyles: { selected: { stroke: '#873bf4' } },
},
```

**完整运行代码**

```ts
import { Graph, register } from '@antv/g6-lite';
import indented from '@antv/g6-lite/layouts/indented';

export async function run(container: HTMLElement) {
  register('layout', 'indented', indented);
  const graph = new Graph({
    container,
    data: {
      nodes: ['Root', 'Group', 'Item', 'Other'].map((id) => ({ id })),
      edges: [
        { id: 'root-group', source: 'Root', target: 'Group' },
        { id: 'group-item', source: 'Group', target: 'Item' },
        { id: 'root-other', source: 'Root', target: 'Other' },
      ],
    },
    node: {
      type: 'rect',
      style: { width: 80, height: 28, borderRadius: 5, label: (node) => node.id, labelPlacement: 'center', labelColor: '#fff' },
    },
    // #region routing
    layout: { type: 'indented', direction: 'LR', indent: 160, rowHeight: 70 },
    edge: {
      type: 'polyline',
      style: { router: 'indented', indentTarget: 'left', radius: 10, lineWidth: 2, hitAreaWidth: 12 },
      stateStyles: { selected: { stroke: '#873bf4' } },
    },
    // #endregion routing
    behaviors: ['click-select'],
    autoFit: { padding: 48, maxZoom: 1 },
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



用 `layout.indent` 和 `layout.rowHeight` 调整缩进和行距。

<span id="缩进目标与主干" style="{ display: 'block', scrollMarginTop: '8rem' }" />

#### 选择子节点的接线位置 [#如何选择-indenttarget]

`indentTarget` 用于横向目录树。像上方示例那样，子节点是矩形时用 `left`，连线接到靠近父节点的一侧。

```ts
edge: {
  type: 'polyline',
  style: { router: 'indented', indentTarget: 'left' },
},
```

子节点只有文字时，可以用 `right` 让线延伸到文字末端。在[缩进树示例](/docs/examples/indented-tree)里切换「有背景」和「无样式」，就能看到区别。

### 设置折线方向 [#方向与更新]

折线随布局方向走。Dagre 布局用 `rankdir`，`LR` 表示从左到右，`TB` 表示从上到下。切换[正交连接与圆角示例](#正交连接与圆角)里的 **Direction** 可以对比两种效果。

```ts
graph.setLayout({ type: 'dagre', rankdir: 'TB', nodeSize: [84, 32] });
await graph.render();
```

缩进树布局用 `direction`。设为 `LR` 向右缩进，设为 `RL` 向左缩进。

## 边标签 [#边标签]

标签名用 `edge.style.label` 设置，位置通过 `edge.style.labelPlacement` 配置。下图从上到下分别展示靠近起点（`start`）、居中（`center`）和靠近终点（`end`）的效果。



```ts
edge: {
  type: 'line',
  style: {
    lineWidth: 2,
    hitAreaWidth: 12,
    label: (_s, _t, edge) => String(edge.id),
    labelPlacement: (_s, _t, edge) => edge.data?.placement as EdgeLabelPlacement,
    labelFontSize: 12,
    labelColor: '#334155',
    labelBackground: (_s, _t, edge) => edge.id === 'start' ? false : '#eef2ff',
    labelBackgroundPadding: 4,
    labelAutoRotate: true,
  },
  stateStyles: { selected: { stroke: '#873bf4' } },
},
```

**完整运行代码**

```ts
import { Graph, type EdgeLabelPlacement } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const rows = ['start', 'center', 'end'] as const;
  const graph = new Graph({
    container,
    data: {
      nodes: rows.flatMap((id, index) => [
        { id: id + '-s', x: 100, y: 50 + index * 90 },
        { id: id + '-t', x: 440, y: 80 + index * 90 },
      ]),
      edges: rows.map((id) => ({ id, source: id + '-s', target: id + '-t', data: { placement: id } })),
    },
    node: { style: { size: 20 } },
    // #region edge-label-options
    edge: {
      type: 'line',
      style: {
        lineWidth: 2,
        hitAreaWidth: 12,
        label: (_s, _t, edge) => String(edge.id),
        labelPlacement: (_s, _t, edge) => edge.data?.placement as EdgeLabelPlacement,
        labelFontSize: 12,
        labelColor: '#334155',
        labelBackground: (_s, _t, edge) => edge.id === 'start' ? false : '#eef2ff',
        labelBackgroundPadding: 4,
        labelAutoRotate: true,
      },
      stateStyles: { selected: { stroke: '#873bf4' } },
    },
    // #endregion edge-label-options
    label: { hideOnCollision: false, hideOnLowZoom: false },
    behaviors: ['click-select'],
    autoFit: { padding: 48, maxZoom: 1 },
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



| 字段                       | 类型                                             | 默认与规则                                           |
| ------------------------ | ---------------------------------------------- | ----------------------------------------------- |
| `label`                  | `EdgeStyleValue<string \| false>`              | `false`；非空字符串才绘制，空串或 `false` 隐藏                 |
| `labelFontSize`          | `EdgeStyleValue<number>`                       | `10` 屏幕像素；使用有限正数                                |
| `labelFontFamily`        | `EdgeStyleValue<string>`                       | 系统无衬线字体栈                                        |
| `labelColor`             | `EdgeStyleValue<string>`                       | `'#666'`，独立于边线颜色                                |
| `labelPlacement`         | `EdgeStyleValue<'start' \| 'center' \| 'end'>` | `'center'`；分别取路径参数 `t = 0.2 / 0.5 / 0.8`，不是精确端点 |
| `labelBackground`        | `EdgeStyleValue<string \| false>`              | `'rgba(255,255,255,0.8)'`；`false` 关闭底色          |
| `labelBackgroundPadding` | `EdgeStyleValue<number>`                       | `2` 屏幕像素，底色四周内边距，使用有限非负数                        |
| `labelAutoRotate`        | `EdgeStyleValue<boolean>`                      | `true`；随路径切线旋转并保持文字正向，`false` 保持水平              |

### 标签背景样式 [#edge-label-background]

用 `labelBackground` 和 `labelBackgroundPadding` 设置底色和内边距。上方示例的 `start` 标签关闭了底色。

### 位置与显示条件 [#位置与显示条件]

`cubic` 和 `polyline` 标签按两端连线定位和旋转。字号和显隐遵循[全局标签策略](/docs/guides/label#全局标签策略)，边和端点的 `hidden` 状态也影响显隐。

### labelRenderer [#edge-label-renderer]

`edge.labelRenderer` 指定标签的绘制方式。下面的 `demo-multiline` 将协议和请求类型画成两行。



```ts
edge: {
  type: 'arc',
  labelRenderer: 'demo-multiline',
  style: {
    label: (_source, _target, edge) => String(edge.data?.label ?? ''),
    labelFontSize: 10,
    labelBackground: 'rgba(255,255,255,0.9)',
    labelBackgroundPadding: 3,
    labelAutoRotate: true,
  },
},
```

**完整运行代码**

```ts
/**
 * Demo: unified custom node/edge LabelRenderer lifecycle.
 * The multiline behavior lives entirely in this demo, not in G6Lite core.
 */
import { Graph, register, type LabelRenderer } from '@antv/g6-lite';

interface MultilineLayoutData {
  lines: string[];
  lineHeight: number;
  contentWidth: number;
}

// #region renderer
const multilineRenderer: LabelRenderer<MultilineLayoutData> = {
  measure({ ctx, text, style }) {
    ctx.font = `${style.labelFontWeight} ${style.labelFontSize}px ${style.labelFontFamily}`;
    const lines = text.split('\n');
    const lineHeight = style.labelFontSize * 1.2;
    const contentWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
    const padding = style.labelBackgroundPadding;
    return {
      width: contentWidth + padding * 2,
      height: lines.length * lineHeight + padding * 2,
      data: { lines, lineHeight, contentWidth },
    };
  },
  draw({ ctx, style, layout }) {
    const data = layout.data;
    if (!data) return;
    if (style.labelBackground) {
      ctx.fillStyle = style.labelBackground;
      ctx.fillRect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    }
    ctx.font = `${style.labelFontWeight} ${style.labelFontSize}px ${style.labelFontFamily}`;
    ctx.fillStyle = style.labelColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    data.lines.forEach((line, index) => {
      const y = (index - (data.lines.length - 1) / 2) * data.lineHeight;
      ctx.fillText(line, 0, y);
    });
  },
};

register('label', 'demo-multiline', multilineRenderer);
// #endregion renderer

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    // Labels are two lines and hang below nodes (labelPlacement: 'bottom');
    // the bottom padding reserves their height so they stay inside the view.
    autoFit: { padding: [24, 48, 64, 48] },
    container,
    data: {
      nodes: [
        { id: 'source', data: { label: 'Source Service\nShanghai' } },
        { id: 'gateway', data: { label: 'API Gateway\nPrimary' } },
        { id: 'target', data: { label: 'Target Store\nHangzhou' } },
      ],
      edges: [
        { source: 'source', target: 'gateway', data: { label: 'HTTPS\nrequest' } },
        { source: 'gateway', target: 'target', data: { label: 'RPC\nresponse' } },
      ],
    },
    layout: { type: 'dagre', rankdir: 'LR', nodeSize: 32, ranksep: 180 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
    // #region node-label
    node: {
      labelRenderer: 'demo-multiline',
      style: {
        size: 32,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'bottom',
        labelFontSize: 12,
        labelBackground: 'rgba(255,255,255,0.92)',
        labelBackgroundPadding: 4,
      },
    },
    // #endregion node-label
    // #region edge-label
    edge: {
      type: 'arc',
      labelRenderer: 'demo-multiline',
      style: {
        label: (_source, _target, edge) => String(edge.data?.label ?? ''),
        labelFontSize: 10,
        labelBackground: 'rgba(255,255,255,0.9)',
        labelBackgroundPadding: 3,
        labelAutoRotate: true,
      },
    },
    // #endregion edge-label
  });
  await graph.render();
  return graph;
}
```



渲染器的注册与实现见[自定义 Label Renderer](/docs/guides/custom-label-renderer)。

## 开发自定义边 [#custom-edge]

用 `EdgeExtension` 封装可复用的路径和样式。注册、使用和运行示例见[自定义边](/docs/guides/custom-edge)。

## 动态更新边 [#动态更新边]

<span id="运行时更新" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="options-edge-运行时更新" style="{ display: 'block', scrollMarginTop: '8rem' }" />

渲染后可更新一条边的数据或调整全图样式。示例中 **Lower SQL latency** 更新 SQL 边，**Set edge color** 改变两条边的颜色。



```ts
panel.addAction('Lower SQL latency', () => {
  graph.updateEdgeData('api-db', { latency: 60 });
});
panel.addAction('Set edge color', () => {
  graph.updateOptions({ edge: { style: { stroke: '#1783FF' } } });
});
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'API', x: 0, y: 0 },
        { id: 'DB', x: 230, y: -55 },
        { id: 'Cache', x: 230, y: 55 },
      ],
      edges: [
        { id: 'api-db', source: 'API', target: 'DB', data: { protocol: 'SQL', latency: 120 } },
        { id: 'api-cache', source: 'API', target: 'Cache', data: { protocol: 'TCP', latency: 24 } },
      ],
    },
    node: { style: { size: 24, label: (node) => node.id } },
    edge: {
      style: {
        stroke: '#64748B',
        lineWidth: (_source, _target, edge) => Number(edge.data?.latency ?? 0) >= 100 ? 4 : 2,
        label: (_source, _target, edge) => `${edge.data?.protocol} · ${edge.data?.latency} ms`,
        labelAutoRotate: false,
      },
    },
    autoFit: { padding: 56, maxZoom: 1 },
    behaviors: [],
  });
  const panel = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    panel.destroy();
    destroy();
  };
  try {
    await graph.render();
    // #region edge-updates
    panel.addAction('Lower SQL latency', () => {
      graph.updateEdgeData('api-db', { latency: 60 });
    });
    panel.addAction('Set edge color', () => {
      graph.updateOptions({ edge: { style: { stroke: '#1783FF' } } });
    });
    // #endregion edge-updates
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



更多操作见 [`updateEdgeData()`](/docs/api/graph#updateedgedata) 和 [`updateOptions()`](/docs/api/graph#updateoptions)。

## 常见问题 [#常见问题]

### 为什么多条边仍然重叠？ [#为什么多条边仍然重叠]

确认 `enabled: true` 且边类型为 `line` 或 `arc`，再检查 `maxOffset` 和 `includeReverse`。

### 为什么改 offset 后自环大小没变？ [#为什么改-offset-后自环大小没变]

自环大小由渲染器决定，`offset` 只控制平行边间距。

### 为什么细线仍然难点中？ [#为什么细线仍然难点中]

配合 `hitAreaWidth` 使用 `click-select` 等交互行为。

### 为什么看不到标签？ [#为什么看不到标签]

检查 `edge.style.label` 是否返回非空文本，再检查缩放、碰撞及边和端点的隐藏状态。

### 为什么运行中修改 router 没有生效？ [#为什么改-router-或-trunkgap-没变化]

用 `updateOptions()` 设置新的 `router` 后，调用 `render()` 重新生成折线路径。

### 为什么边没有按预期绕开节点？ [#为什么边没有按预期绕开节点]

`orth` 根据两个端点布线。可调整布局和节点间距，避免边穿过其他节点。

### 为什么配置了状态却没触发？ [#为什么配置了状态却没触发]

用交互行为或 `setItemState(edgeId, state, true)` 激活状态。

### 为什么线没有贴合节点边界？ [#为什么线没有贴合节点边界]

检查节点实际尺寸、布局 `nodeSize` 和方向。横向目录树中的矩形可用 `indentTarget: 'left'`。

### 为什么标签看起来没有沿折线排列？ [#为什么标签看起来没有沿折线排列]

`polyline` 标签按两端连线定位和旋转。

<span id="其他配置" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## 相关 [#相关]

* [EdgeConfig 配置概览](/docs/api/options#options-edge)
* [数据模型](/docs/guides/data#节点边与分组)：边身份、端点和业务数据。
* [交互配置](/docs/guides/behaviors)：行为组合与选中操作。
* [标签与图标](/docs/guides/label)：跨节点和边的标签使用。
* [示例总览](/docs/examples)：更多场景与可运行案例。

**相关可运行示例**

* [边与箭头方向](/docs/examples/edge-arrows)
* [边类型](/docs/examples/edge-types)
* [边颜色](/docs/examples/edge-colors)
* [边状态与权重](/docs/examples/edge-states)
* [交互热区](/docs/examples/edge-hit-area)
* [平行边与反向边](/docs/examples/parallel-edges)
* [自环边](/docs/examples/edge-loops)
* [折线与正交路由](/docs/examples/polyline-routing)
