# 标签与图标 (/docs/guides/label)





先配置文本与位置，再选择显示策略。查完整字段见[节点标签与图标](/docs/guides/node#标签)、[边标签](/docs/guides/edge#边标签)和[标签策略参考](/docs/api/options#options-label)。

## 节点标签 [#节点标签]

1. 在 `node.style.label` 提供文本，或用回调读取节点数据；data.name 不会自动显示。
2. 用 labelPlacement 选择位置，再用 labelOffsetX/Y 微调。
3. 用 labelFontSize、labelColor 设置字号和颜色，默认渲染器无需手动换算 DPR。

下面分别展示左侧、下方和右侧标签，以及隐藏标签的节点。



```ts
import { Graph, type LabelPlacement } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'api', name: 'API', x: 100, y: 100, data: { placement: 'left' } },
        { id: 'Database', x: 260, y: 100 },
        { id: 'cache', name: 'Cache', x: 420, y: 100, data: { placement: 'right' } },
        { id: 'worker', name: 'Worker', x: 580, y: 100, data: { hideLabel: true } },
      ],
      edges: [],
    },
    // #region label-style
    node: {
      style: {
        size: 40,
        fill: '#1783FF',
        label: (node) => node.data?.hideLabel ? false : (node.name ?? node.id),
        labelPlacement: (node) => (node.data?.placement as LabelPlacement | undefined) ?? 'bottom',
        labelFontSize: 14,
        labelFontWeight: '600',
      },
    },
    // #endregion label-style
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



## 节点图标 [#节点图标]

下面的左侧节点使用文字图标，右侧节点使用图片图标。

* 文字或字体图标：设置 `iconType: 'text'`，用 iconFontSize、iconColor 调整；字体须由应用加载。
* 图片图标：设置 `iconType: 'image'` 和图片 URL，用 iconWidth/Height 调整。图片异步加载，跨域资源需允许匿名 CORS。

图标随节点缩放，不受全局标签的低缩放或碰撞隐藏控制。完整字段见[图标参考](/docs/guides/node#图标)。



```ts
node: {
  style: {
    size: 56,
    fill: (node) => node.id === 'image' ? '#e6f4ff' : '#1783ff',
    iconType: (node) => node.id === 'image' ? 'image' : 'text',
    icon: (node) => node.id === 'image' ? imageUrl : 'A',
    iconWidth: 24,
    iconHeight: 21,
    iconOffsetY: -4,
    iconFontSize: 24,
    iconColor: '#fff',
    label: (node) => node.name ?? node.id,
    labelOffsetY: 6,
  },
},
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';

const imageUrl = new URL('../src/app/icon.svg', import.meta.url).href;

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'text', name: 'Text', x: 100, y: 100 },
        { id: 'image', name: 'Image', x: 260, y: 100 },
      ],
      edges: [],
    },
    // #region icon-style
    node: {
      style: {
        size: 56,
        fill: (node) => node.id === 'image' ? '#e6f4ff' : '#1783ff',
        iconType: (node) => node.id === 'image' ? 'image' : 'text',
        icon: (node) => node.id === 'image' ? imageUrl : 'A',
        iconWidth: 24,
        iconHeight: 21,
        iconOffsetY: -4,
        iconFontSize: 24,
        iconColor: '#fff',
        label: (node) => node.name ?? node.id,
        labelOffsetY: 6,
      },
    },
    // #endregion icon-style
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



## 长文本与背景 [#长文本与背景]

默认节点标签用 labelMaxWidth 截断长文本，用 labelBackground 和 labelBackgroundPadding 增加底色与留白。下面长名称限制为 120。



```ts
import { Graph, type NodeConfig } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region node-label
  const node: NodeConfig = {
    style: {
      size: 40,
      label: (item) => String(item.data?.name ?? item.id),
      labelPlacement: 'bottom',
      labelMaxWidth: 120,
      labelBackground: (item) => item.id === 'db' ? '#fff1b8' : '#e6f4ff',
      labelBackgroundPadding: 6,
      labelFontWeight: '600',
    },
  };
  // #endregion node-label
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'api', x: 120, y: 100, data: { name: 'API Server' } },
        { id: 'db', x: 360, y: 100, data: { name: 'Database with a very long name' } },
      ],
      edges: [],
    },
    node,
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



需要特殊排版时使用[自定义 Label Renderer](/docs/guides/custom-label-renderer)：先注册，再指定 node.labelRenderer 或 edge.labelRenderer，并保留非空 style.label。自定义绘制自行处理截断。

## 边标签 [#边标签]

在 `edge.style.label` 配置文本。回调为 `(source, target, edge) => text`，第三项才是边数据；文字颜色使用 labelColor，与边线颜色独立。

下面对比 start、center、end 三个位置，开启 labelAutoRotate 随方向旋转。示例关闭低缩放与碰撞隐藏，方便观察。



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



业务中可保留默认显示策略。边标签保持屏幕字号；曲线、折线路径的定位限制见[位置与显示条件](/docs/guides/edge#位置与显示条件)。

## 全局标签策略 [#全局标签策略]

配置 Graph 顶层 `label`，按目标选择：

* 保持文字屏幕大小：设置 `scaleWithZoom: false`；该开关影响节点标签，边标签始终保持屏幕尺寸。
* 调整出现时机：设置 nodeMinZoom、edgeMinZoom；只关闭一种阈值时将对应值设为 0。
* 检查重叠或隐藏原因：暂时关闭 hideOnCollision 或 hideOnLowZoom，确认后再恢复需要的策略。

### 观察标签显隐 [#options-label-代码与对应效果]

示例初始 zoom 为 0.4，并显式关闭 scaleWithZoom，保持文字可读。节点标签通过阈值，Request 边标签低于 0.5 而隐藏；两条相邻节点标签因碰撞仅保留先绘制的一条。

* 关闭 hideOnCollision：查看相邻标签重叠。
* 关闭 hideOnLowZoom：在当前缩放下显示边标签。
* 开启 scaleWithZoom，再放大或缩小：比较节点与边的字号变化。



```ts
import { Graph, type LabelOptions } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  // #region label-options
  const policy: Required<LabelOptions> = {
    scaleWithZoom: false,
    hideOnLowZoom: true,
    hideOnCollision: true,
    nodeMinZoom: 0.3,
    edgeMinZoom: 0.5,
  };
  // #endregion label-options
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'Client alpha', x: 0, y: 100 },
        { id: 'Client beta', x: 100, y: 100 },
        { id: 'API gateway', x: 900, y: 100 },
      ],
      edges: [{ id: 'Request', source: 'Client beta', target: 'API gateway' }],
    },
    node: { style: { size: 48, label: (node) => node.id, labelFontSize: 14 } },
    edge: { style: { label: (_s, _t, edge) => edge.id ?? '', labelFontSize: 14 } },
    label: policy,
    behaviors: [],
    autoFit: { minZoom: 0.4, maxZoom: 0.4 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); destroy(); };
  try {
    await graph.render();
    const settings = { ...policy };
    for (const key of ['scaleWithZoom', 'hideOnLowZoom', 'hideOnCollision'] as const) {
      ui.gui.add(settings, key).onChange((checked: boolean) => {
        graph.updateOptions({ label: { [key]: checked } });
      });
    }
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



### 缩放阈值 [#缩放阈值]

默认开启低缩放隐藏时，通过阈值检查的标签如下；最终还须通过内容、显隐与碰撞检查。

| 相机 zoom     | 节点标签   | 边标签    |
| ----------- | ------ | ------ |
| 小于 0.3      | 隐藏     | 隐藏     |
| 0.3 至小于 0.5 | 进入绘制候选 | 隐藏     |
| 大于等于 0.5    | 进入绘制候选 | 进入绘制候选 |

仅需让一种标签始终通过阈值时，将其 MinZoom 设为 0。关闭 hideOnLowZoom 不会关闭碰撞隐藏。

阈值使用有限非负数，`0` 也有效。传入负数、`NaN` 或 `Infinity` 时沿用对应默认值。阈值直接与相机 `zoom` 比较。

### 碰撞顺序 [#碰撞顺序]

每帧先处理节点标签，再处理边标签；各自按渲染数据顺序处理。先绘制的标签占用空间，后续重叠标签被隐藏。每帧重新计算，缩放或数据顺序变化可能改变保留结果；selected、highlight 不自动获得优先级。

#### 碰撞范围与自定义渲染器 [#碰撞范围与自定义渲染器]

内置标签按未旋转的文字矩形检测，不额外包含背景内边距；自定义 labelRenderer 使用 measure 返回的宽高。该策略隐藏重叠标签，不负责移动标签或避让节点主体。

自定义节点、边 labelRenderer 也经过低缩放与碰撞检查；尺寸策略作用于引擎提供的 style。若渲染器自行根据 zoom 绘制尺寸，需自行保持一致。节点标签缩放有内部限幅，极端 zoom 下并非无限线性变化。

### 生效范围 [#生效范围]

* 标签须有非空文本；`label: false` 或空串不绘制。业务 data 本身不会生成标签。
* 节点图标、decorations 徽章和 Combo 标签使用各自规则，不受这 5 个字段控制。
* hidden 元素、隐藏端点关联的边标签和视口裁剪仍会影响显示；关闭两种隐藏策略不保证所有文本都可见。

内容、位置和字号的完整定义见[节点标签](/docs/guides/node#标签)、[边标签](/docs/guides/edge#边标签)；Combo 的规则见[分组标签](/docs/guides/combo#留白包围框与标签)。

<span id="options-label-运行时更新" />

## 运行时更新 [#运行时更新]

首次 `await graph.render()` 后，更新外观和显示策略，无需重建实例：

```ts
graph.updateOptions({ node: { style: { labelColor: '#334155' } } });
graph.updateOptions({ edge: { style: { labelColor: '#475569' } } });
graph.updateOptions({ label: { hideOnCollision: false } });
graph.updateOptions({ label: { nodeMinZoom: 0.6 } });
```

两次 `label` 更新分别设置碰撞开关和节点阈值，省略的字段保留当前值。传入 `label: {}` 会保留整套策略。显式将某个字段设为 `undefined` 可恢复该字段的默认值。

更新会重新处理样式和已配置的转换。布局和视口沿用当前结果。业务数据变化时用 `updateNodeData()` 或 `updateEdgeData()` 更新，标签回调可读取新值。详见[配置更新](/docs/api/graph#updateoptions)。

## 性能提示 [#性能提示]

* 大图优先显示关键节点与关系；业务过滤可让 label 回调返回 false。
* 缩放显隐使用全局标签策略；标签回调接收元素数据，不接收相机 zoom，保持回调轻量。

## 常见问题 [#常见问题]

### 为什么标签没有显示？ [#为什么标签没有显示]

依次检查非空 label、缩放阈值、碰撞、元素与边端点的 hidden 状态。业务 data 本身不生成文字，关闭阈值也不会关闭碰撞隐藏。

### 为什么文字图标或图片没有显示？ [#为什么文字图标或图片没有显示]

文字图标须设置 iconType: 'text' 并加载对应字体；图片检查 URL 和匿名 CORS。图标仍受节点 hidden 和视口范围影响。

### 为什么长文本没有截断？ [#为什么长文本没有截断]

labelMaxWidth 用于默认节点标签，需大于 0；边不提供该字段，自定义渲染器需自行处理。默认节点标签不会自动换行。

### 为什么设置颜色后文字没变？ [#为什么设置颜色后文字没变]

使用 labelColor；labelFill 不是受支持字段。边的 stroke、文字图标的 iconColor 与标签颜色分别配置。

<span id="options-label-相关入口" />

## 相关 [#相关]

* [节点标签与图标参考](/docs/guides/node#标签)：字段与生效条件。
* [边标签参考](/docs/guides/edge#边标签)：位置、旋转和路径限制。
* [LabelOptions 字段与默认值](/docs/api/options#options-label)
* [自定义 Label Renderer](/docs/guides/custom-label-renderer)

**相关可运行示例**

* [标签位置与图标](/docs/examples/labels)
* [标签渲染策略](/docs/examples/label-rendering-options)
