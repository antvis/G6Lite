# 节点通用配置项 (/docs/guides/node)





<span id="options-node" style="{ display: 'block', scrollMarginTop: '8rem' }" />

通过 `GraphOptions.node` 选择形状、配置外观或接入业务节点。节点的数据结构和基本配置方法见[节点总览](/docs/elements/node)。

<span id="顶层配置" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## NodeConfig [#nodeconfig]

`NodeConfig` 对应 `new Graph()` 的 `node` 选项，所有字段均可省略。下面配置一个带标签的圆形节点，并用 `states` 使它在首次渲染时处于选中状态。运行前请在页面上准备一个有宽高的 `#container` 元素，详见[快速上手](/docs/getting-started/quick-start)。

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: '#container',
  data: {
    nodes: [{ id: 'api', name: 'API', x: 100, y: 80, states: ['selected'] }],
    edges: [],
  },
  node: {
    type: 'circle',
    style: {
      size: 32,
      fill: '#1783FF',
      label: (node) => node.name ?? node.id,
    },
    stateStyles: {
      selected: { stroke: '#1D39C4', strokeWidth: 2, haloWidth: 14 },
    },
  },
});

await graph.render();
```

| 字段                                     | 说明           | 类型                                                                   | 默认或回退        |
| -------------------------------------- | ------------ | -------------------------------------------------------------------- | ------------ |
| [`type`](#类型)                          | 节点形状或注册名称    | `string`                                                             | `'circle'`   |
| [`style`](#样式字段)                       | 主图形、标签和图标的样式 | `NodeStyleConfig \| ((node: GraphNode) => Partial<NodeStyleConfig>)` | 使用主题和字段回退值   |
| [`stateStyles`](#options-node-状态样式)    | 按状态覆盖节点外观    | `Partial<Record<NodeState, NodeStateStyleOverride>>`                 | 使用扩展或主题的状态定义 |
| [`labelRenderer`](#labelrenderer)      | 已注册的标签渲染器名称  | `string`                                                             | 内置标签渲染器      |
| [`decorations`](#nodedecorationconfig) | 徽章或自定义装饰     | `NodeDecorationConfig[]`                                             | 无装饰          |

## Type 节点类型 [#类型]

<span id="基础配置" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="node-circle" style="{ display: 'block', scrollMarginTop: '8rem' }" />

`node.type` 接受一个字符串，为整张图选择节点类型，默认是 `circle`。可以使用内置类型或已注册的节点扩展名称。要按节点数据改变颜色、尺寸等外观，请使用 [样式函数](#样式函数)。

| 形状需求        | 选择与尺寸                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| 圆点、人物或设备标记  | `type: 'circle'`，用 `size` 设置直径                                                           |
| 业务卡片或横向标签节点 | `type: 'rect'`，用 `width`、`height` 设置宽高，`borderRadius` 设置圆角                               |
| 复用业务节点表现形式  | 先 `register('node', name, extension)`，再将 `type` 设为该名称；见[自定义节点](/docs/guides/custom-node) |

## Style 节点样式 [#样式字段]

`node.style` 用于配置主图形、标签、标签背景和图标。光晕由[状态样式](#halo-style)控制，徽章通过 [`node.decorations`](#nodedecorationconfig) 配置。

### 主图形样式 [#nodestyleconfig]

下表是 `NodeStyleConfig` 的基础样式字段，默认值适用于内置节点的 **style 对象**，包括逐字段样式函数。省略 `theme` 时采用 light 预设，自定义主题和节点扩展可改变回退值。

| 字段             | 类型                       | 默认或回退                                               | 说明                       |
| -------------- | ------------------------ | --------------------------------------------------- | ------------------------ |
| `fill`         | `NodeStyleValue<string>` | `theme.nodeFill`，预设为 `'#1783FF'`                    | 填充颜色                     |
| `size`         | `NodeStyleValue<number>` | `theme.nodeSize`，预设为 `24`                           | 圆形直径；矩形未单独指定宽高时的回退尺寸     |
| `width`        | `NodeStyleValue<number>` | 解析后的 `size`                                         | 矩形宽度；不改变内置圆形的直径          |
| `height`       | `NodeStyleValue<number>` | 解析后的 `size`                                         | 矩形高度；不改变内置圆形的直径          |
| `stroke`       | `NodeStyleValue<string>` | `theme.nodeStroke`；light 为 `'#fff'`，dark 为 `'#333'` | 描边颜色                     |
| `strokeWidth`  | `NodeStyleValue<number>` | `theme.nodeStrokeWidth`，预设为 `0`                     | 描边宽度；为 `0` 时不显示描边        |
| `opacity`      | `NodeStyleValue<number>` | `1`                                                 | 主图形与光晕的不透明度，使用 `0` 到 `1` |
| `borderRadius` | `NodeStyleValue<number>` | `0`                                                 | 矩形圆角；绘制时不超过宽高较小值的一半      |

`size`、`width`、`height`、`strokeWidth` 和 `borderRadius` 使用图坐标长度，随相机缩放。隐藏整个节点及其标签、图标和徽章时，使用 [Graph 显隐方法](/docs/api/graph#状态显隐和定位)。

矩形的宽和高分别回退到 `size`。例如，`style: { size: 40, width: 96 }` 会得到宽 `96`、高 `40` 的矩形。即使显式指定了宽高，默认标签的定位和图标的默认尺寸仍以 `size` 为基准。

<span id="node-rect" style="{ display: 'block', scrollMarginTop: '8rem' }" />

下面的示例显式设置矩形宽 `96`、高 `40`、圆角 `8`，并按 `data.risk` 映射填充色。点击节点可查看选中描边。



```ts
import { Graph, type NodeConfig } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const node: NodeConfig = {
    type: 'rect',
    style: {
      size: 32,
      width: 96,
      height: 40,
      borderRadius: 8,
      fill: (item) => item.data?.risk === 'high' ? '#ff4d4f' : '#1783FF',
      stroke: '#fff',
      strokeWidth: 1,
    },
    stateStyles: {
      selected: { stroke: '#163B65', strokeWidth: 2 },
    },
  };
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'high-risk', x: 120, y: 100, data: { risk: 'high' } },
        { id: 'normal-risk', x: 360, y: 100, data: { risk: 'normal' } },
      ],
      edges: [],
    },
    node,
    autoFit: { padding: 40, maxZoom: 1 },
    behaviors: ['click-select'],
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



### 样式函数 [#样式函数]

样式函数根据每个节点的数据计算样式，比如用数值决定节点大小，用分组决定颜色。



```ts
node: {
  type: 'circle',
  style: {
    size: (node) => Number(node.data?.value ?? 24),
    fill: (node) => node.data?.group === 'core' ? '#1783FF' : '#61DDAA',
    label: (node) => `${node.id}: ${node.data?.value}`,
    labelPlacement: 'bottom',
    labelOffsetY: 6,
  },
  stateStyles: {
    selected: { stroke: '#163B65', strokeWidth: 3, haloWidth: 12 },
  },
},
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
        { id: 'A', x: 80, y: 100, data: { value: 16, group: 'core' } },
        { id: 'B', x: 240, y: 100, data: { value: 28, group: 'other' } },
        { id: 'C', x: 400, y: 100, data: { value: 40, group: 'core' } },
      ],
      edges: [{ source: 'A', target: 'B' }, { source: 'B', target: 'C' }],
    },
    // #region node-options
    node: {
      type: 'circle',
      style: {
        size: (node) => Number(node.data?.value ?? 24),
        fill: (node) => node.data?.group === 'core' ? '#1783FF' : '#61DDAA',
        label: (node) => `${node.id}: ${node.data?.value}`,
        labelPlacement: 'bottom',
        labelOffsetY: 6,
      },
      stateStyles: {
        selected: { stroke: '#163B65', strokeWidth: 3, haloWidth: 12 },
      },
    },
    // #endregion node-options
    edge: { style: { stroke: '#94a3b8' } },
    autoFit: { padding: 40, maxZoom: 1 },
    behaviors: ['click-select'],
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy();
    destroy();
  };
  try {
    await graph.render();
    ui.addAction('B: 28 / 40', () => {
      const value = graph.getNodeData('B')?.data?.value === 28 ? 40 : 28;
      graph.updateNodeData('B', { value });
    });
    ui.addAction('Fill', () => {
      graph.updateOptions({ node: { style: { fill: '#7262FD' } } });
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



### 标签样式 [#标签]

以下字段均位于 `node.style`，每个字段都可以设为固定值或函数。

| 字段                | 类型                                | 默认值        | 说明                                                 |
| ----------------- | --------------------------------- | ---------- | -------------------------------------------------- |
| `label`           | `NodeStyleValue<string \| false>` | 不绘制        | 标签文本；`false`、空字符串或未配置时均不绘制                         |
| `labelFontSize`   | `NodeStyleValue<number>`          | `12`       | 字号，以 CSS 像素为基准，渲染时换算 DPR 与标签缩放                     |
| `labelFontFamily` | `NodeStyleValue<string>`          | 系统无衬线字体栈   | Canvas 字体族                                         |
| `labelFontWeight` | `NodeStyleValue<string>`          | `'normal'` | Canvas 字重，例如 `'600'`                               |
| `labelColor`      | `NodeStyleValue<string>`          | `'#333'`   | 文本颜色，未配置时不自动跟随 dark 主题变白                           |
| `labelPlacement`  | `NodeStyleValue<LabelPlacement>`  | `'bottom'` | `'center'`、`'top'`、`'bottom'`、`'left'` 或 `'right'` |
| `labelOffsetX`    | `NodeStyleValue<number>`          | `0`        | 水平偏移，以 CSS 像素为基准，正值向右                              |
| `labelOffsetY`    | `NodeStyleValue<number>`          | `0`        | 垂直偏移，以 CSS 像素为基准，正值向下                              |
| `labelMaxWidth`   | `NodeStyleValue<number>`          | `0`        | 默认渲染器的文字宽度上限；大于 `0` 时超长文字以 `...` 截断，非正值不限宽         |

默认标签按 `size` 定位，宽高不同的矩形可用 `labelOffsetX` 和 `labelOffsetY` 微调。固定屏幕字号、低缩放隐藏和碰撞隐藏见[全局标签策略](/docs/guides/label#全局标签策略)。

下面把 API、Database 和 Cache 的标签分别放在左侧、下方和右侧。Database 没有 `name`，所以显示 `id`。最右侧的 Worker 设置了 `data.hideLabel`，因此只显示节点。



```ts
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
```

**完整运行代码**

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



### 标签背景样式 [#label-background]

为 `labelBackground` 设置颜色即可给文字加底色。背景内边距以 CSS 像素为基准，随标签缩放。默认碰撞检测使用文字测量框。

| 字段                       | 类型                                | 默认值     | 说明                  |
| ------------------------ | --------------------------------- | ------- | ------------------- |
| `labelBackground`        | `NodeStyleValue<string \| false>` | `false` | 文字背景色；`false` 关闭背景  |
| `labelBackgroundPadding` | `NodeStyleValue<number>`          | `2`     | 背景四周内边距，以 CSS 像素为基准 |

下面给 API 和数据库标签分别加浅蓝和浅黄底色，并各留 `6` 像素内边距。数据库名称超过 `labelMaxWidth: 120` 时会截断，背景宽度也以 `120` 加两侧内边距为上限。



```ts
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
```

**完整运行代码**

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



### 图标样式 [#图标]

图标同样配置在 `node.style`，支持固定值或函数。

| 字段               | 类型                                  | 默认值                  | 生效条件与单位                                        |
| ---------------- | ----------------------------------- | -------------------- | ---------------------------------------------- |
| `icon`           | `NodeStyleValue<string \| false>`   | 不绘制                  | 图片 URL 或文本；含义由 `iconType` 决定，空字符串和 `false` 不绘制 |
| `iconType`       | `NodeStyleValue<'image' \| 'text'>` | `'image'`            | 图片或文字图标                                        |
| `iconWidth`      | `NodeStyleValue<number>`            | 解析后 `size` 的 `0.6` 倍 | 仅图片图标，图坐标宽度                                    |
| `iconHeight`     | `NodeStyleValue<number>`            | 解析后 `size` 的 `0.6` 倍 | 仅图片图标，图坐标高度                                    |
| `iconFontFamily` | `NodeStyleValue<string>`            | 系统无衬线字体栈             | 仅文字图标，所用字体须由应用加载                               |
| `iconFontSize`   | `NodeStyleValue<number>`            | 解析后 `size` 的 `0.6` 倍 | 仅文字图标，图坐标字号；渲染后不足 4 个 Canvas 像素时跳过             |
| `iconColor`      | `NodeStyleValue<string>`            | `'#fff'`             | 仅文字图标                                          |
| `iconOffsetX`    | `NodeStyleValue<number>`            | `0`                  | 图坐标偏移，正值向右                                     |
| `iconOffsetY`    | `NodeStyleValue<number>`            | `0`                  | 图坐标偏移，正值向下                                     |

文字图标的字号由 `label.scaleWithZoom` 控制。图片尺寸和所有图标的偏移随相机缩放。图标不参加标签碰撞隐藏，也不受 `nodeMinZoom` 控制；`hidden` 节点仍会跳过绘制。图片异步加载，成功后重绘；跨域图片需允许匿名 CORS，失败后本实例不会自动重试同一 URL。

<span id="标签与图标" style="{ display: 'block', scrollMarginTop: '8rem' }" />

下面在左侧节点绘制文字图标 `A`，在右侧节点绘制 AntV 图片。两种图标都向上偏移 `4` 个图坐标单位，节点名称留在下方。可将 `imageUrl` 换成应用中的图片地址。



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



### labelRenderer [#labelrenderer]

`node.labelRenderer` 用来指定标签的绘制方式。下面的 `style.label` 提供文本，`demo-multiline` 把服务名称和位置或角色画成两行。



```ts
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



## 徽章装饰 [#徽章装饰]

<span id="nodedecorationconfig" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="内容与显示" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="放置与偏移" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="堆叠与溢出" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="内置徽章" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="自定义装饰渲染器" style="{ display: 'block', scrollMarginTop: '8rem' }" />

在 [`node.decorations`](/docs/api/options#config-node-decoration) 中使用 `builtin-badge`，可以在节点旁显示计数、告警或权限标记。



```ts
decorations: [{
  renderer: 'builtin-badge',
  placement: 'right',
  attachment: 'boundary',
  anchor: 'start',
  boundaryOverlap: 'half-badge',
  layout: 'stack',
  items: [
    { kind: 'count', value: 12 },
    { kind: 'warning' },
    { kind: 'text', text: 'VIP' },
    { kind: 'lock' },
    { kind: 'favorite' },
  ] satisfies NodeBadgeItem[],
  maxVisible: 3,
  overflow: 'hover-expand',
  overflowData: { kind: 'text', text: '···' },
}],
```

**完整运行代码**

```ts
import { Graph, type NodeBadgeItem } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: { nodes: [{ id: 'Orders', x: 120, y: 100 }], edges: [] },
    node: {
      style: { size: 64, fill: '#1783FF', label: (node) => node.id },
      // #region badge-options
      decorations: [{
        renderer: 'builtin-badge',
        placement: 'right',
        attachment: 'boundary',
        anchor: 'start',
        boundaryOverlap: 'half-badge',
        layout: 'stack',
        items: [
          { kind: 'count', value: 12 },
          { kind: 'warning' },
          { kind: 'text', text: 'VIP' },
          { kind: 'lock' },
          { kind: 'favorite' },
        ] satisfies NodeBadgeItem[],
        maxVisible: 3,
        overflow: 'hover-expand',
        overflowData: { kind: 'text', text: '···' },
      }],
      // #endregion badge-options
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



初始显示计数、告警和 `···`。悬停 `···` 查看全部 5 枚徽章。



<span id="状态样式" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## State styles 状态样式 [#options-node-状态样式]

[`node.stateStyles`](/docs/api/options#config-node-state-style) 按状态设置节点外观。示例中 A 初始带有选中描边，点击 **Toggle review** 可叠加橙色填充。



```ts
stateStyles: {
  selected: { stroke: '#6D28D9', strokeWidth: 3 },
  review: { fill: '#F59E0B' },
  highlight: { fill: '#00A876', stroke: '#005C41', strokeWidth: 2 },
},
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



### 光晕样式 [#halo-style]

`haloWidth` 设置节点外侧光晕的宽度。示例从左到右对比默认、激活和选中三种状态，激活和选中的光晕宽度分别为 `8` 和 `22`。



```ts
stateStyles: {
  active: { haloWidth: 8 },
  selected: { haloWidth: 22 },
},
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'Default', x: 0, y: 0 },
        { id: 'Active', x: 140, y: 0, states: ['active'] },
        { id: 'Selected', x: 280, y: 0, states: ['selected'] },
      ],
      edges: [],
    },
    node: {
      style: { size: 40, label: (node) => node.id, labelOffsetY: 22 },
      // #region halo-options
      stateStyles: {
        active: { haloWidth: 8 },
        selected: { haloWidth: 22 },
      },
      // #endregion halo-options
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



## 开发自定义节点 [#custom-node]

如何用 `NodeExtension` 创建和注册可复用的节点类型，见[自定义节点](/docs/guides/custom-node)。

## 动态更新节点 [#动态更新节点]

<span id="运行时更新" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="options-node-运行时更新" style="{ display: 'block', scrollMarginTop: '8rem' }" />

渲染后可更新节点数据或全局样式。点击 **Restore DB** 修改 DB 的状态和颜色，再点击 **Labels on top** 把所有节点标签移到上方。



```ts
ui.addAction('Restore DB', () => {
  graph.updateNodeData('DB', { status: 'healthy' });
});
ui.addAction('Labels on top', () => {
  graph.updateOptions({ node: { style: { labelPlacement: 'top', labelOffsetY: -4 } } });
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
        { id: 'API', x: 0, y: 0, data: { status: 'healthy' } },
        { id: 'DB', x: 190, y: 0, data: { status: 'degraded' } },
      ],
      edges: [{ source: 'API', target: 'DB' }],
    },
    node: {
      type: 'rect',
      style: {
        size: 40,
        width: 88,
        height: 36,
        borderRadius: 6,
        fill: (node) => node.data?.status === 'degraded' ? '#D97706' : '#0F766E',
        label: (node) => `${node.id}: ${node.data?.status}`,
        labelOffsetY: 4,
      },
    },
    autoFit: { padding: 64, maxZoom: 1 },
    behaviors: [],
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy();
    destroy();
  };
  try {
    await graph.render();
    // #region runtime-updates
    ui.addAction('Restore DB', () => {
      graph.updateNodeData('DB', { status: 'healthy' });
    });
    ui.addAction('Labels on top', () => {
      graph.updateOptions({ node: { style: { labelPlacement: 'top', labelOffsetY: -4 } } });
    });
    // #endregion runtime-updates
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



更多操作见 [`updateNodeData()`](/docs/api/graph#updatenodedata) 和 [`updateOptions()`](/docs/api/graph#updateoptions)。

## 常见问题 [#常见问题]

**设置了宽高，节点仍是圆形**

确认 `type: 'rect'`；内置圆形使用 `size`，不使用矩形宽高。

**设置了状态样式，点击却没有变化**

同时配置选择行为或调用状态 API；若 `style` 使用整对象函数，先改为逐字段配置函数以应用状态外观。

**标签不显示，或缩小后消失**

先检查 `style.label` 是否非空，再检查顶层 `label` 的低缩放和碰撞策略；见[标签指南](/docs/guides/label#全局标签策略)。

**图标未显示**

文字指定 `iconType: 'text'`；图片指定 `'image'`，检查地址、跨域访问和加载结果。

**指定了自定义类型或渲染器却不生效**

先注册，再创建或更新配置；自定义标签还需非空 `style.label`。

**徽章比 `maxVisible` 少一项**

折叠时会预留溢出位置；提供 `overflowData` 显示占位项，悬停展开还需 `overflow: 'hover-expand'`。

**热更新后其他状态或徽章丢失**

`stateStyles` 和 `decorations` 整体替换；更新时提交希望保留的完整集合。

## 性能建议 [#性能建议]

* 内置圆形和矩形由 WebGL 绘制；同一种外观优先用固定值，按数据分类时使用轻量的样式函数，避免在函数中请求数据或执行重计算。
* 高频选中和高亮切换使用状态 API；业务字段变化采用增量更新，减少整图替换和重新布局。
* 大图按需显示标签和装饰，结合低缩放、碰撞及数量限制；自定义标签和装饰的测量绘制保持轻量。

## 相关 [#相关]

<span id="相关参考" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### 按效果选择示例 [#按效果选择示例]

| 要验证的配置                | 可运行示例                                            | 操作与预期                                     |
| --------------------- | ------------------------------------------------ | ----------------------------------------- |
| `type` 与基础尺寸          | [图形类型](/docs/examples/shapes)                    | 对比圆形和矩形的轮廓、宽高                             |
| 逐字段样式函数               | [节点数据映射样式](/docs/examples/node-style)            | 对比不同分组颜色和中心节点尺寸，悬停查看关联高亮                  |
| 状态覆盖                  | [默认主题与状态](/docs/examples/default-theme)          | 对比主题与内置状态的外观                              |
| `label*`、`icon*` 与热更新 | [标签位置与图标](/docs/examples/labels)                 | 切换位置、节点图标和边标签，观察它们各自变化                    |
| 全局标签显示策略              | [标签渲染策略](/docs/examples/label-rendering-options) | 切换策略并缩放，对比文字显示；这些策略不等同于图标配置               |
| `labelRenderer`       | [自定义标签渲染](/docs/examples/custom-label-renderer)  | 对比自定义内容与普通文字；注册与配置过程见源码                   |
| `decorations`         | [节点徽章](/docs/examples/decoration-badges)         | 悬停溢出入口展开 5 项徽章，移出后折叠；修改 `maxVisible` 比较结果 |

### 指南与协议 [#指南与协议]

* [标签与图标](/docs/guides/label)
* [自定义 Label Renderer](/docs/guides/custom-label-renderer)
* [自定义节点装饰](/docs/guides/custom-decoration)
* [边](/docs/guides/edge)
* [节点边框与圆角](/docs/examples/node-border)
