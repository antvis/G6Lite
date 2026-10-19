import type { Locale } from './i18n';
import { localizedPath } from './i18n';

export type SiteExampleCategoryId =
  | 'getting-started'
  | 'data-and-state'
  | 'elements'
  | 'layouts'
  | 'interactions'
  | 'viewport'
  | 'extensions'
  | 'scenarios-and-performance';

export interface LocalizedText {
  zh: string;
  en: string;
}

export interface SiteExampleMetric {
  label: LocalizedText;
  value: string;
}

export interface SiteExampleDefinition {
  id: string;
  file: string;
  category: SiteExampleCategoryId;
  group: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  interaction: LocalizedText;
  dataDescription: LocalizedText;
  dataPreview: string;
  tags: string[];
  metrics: SiteExampleMetric[];
}

export interface SiteExampleCategory {
  id: SiteExampleCategoryId;
  title: LocalizedText;
  description: LocalizedText;
}

export const siteExampleCategories: readonly SiteExampleCategory[] = [
  {
    id: 'getting-started',
    title: { zh: '快速开始', en: 'Getting started' },
    description: {
      zh: '从最小 Graph 配置开始，理解数据、布局和画布交互。',
      en: 'Start with the smallest Graph configuration and learn data, layout, and canvas navigation.',
    },
  },
  {
    id: 'data-and-state',
    title: { zh: '数据与状态', en: 'Data and state' },
    description: {
      zh: '覆盖数据增删改、元素查询、邻接关系、状态与可见性。',
      en: 'Explore data mutations, element queries, adjacency, states, and visibility.',
    },
  },
  {
    id: 'elements',
    title: { zh: '元素', en: 'Elements' },
    description: {
      zh: '配置节点、边、标签、箭头、平行边与 Combo 分组。',
      en: 'Configure nodes, edges, labels, arrows, parallel edges, and combos.',
    },
  },
  {
    id: 'layouts',
    title: { zh: '布局', en: 'Layouts' },
    description: {
      zh: '比较常用布局，并在运行时切换不同的图结构表达。',
      en: 'Compare common layouts and switch graph structure presentations at runtime.',
    },
  },
  {
    id: 'interactions',
    title: { zh: '交互', en: 'Interactions' },
    description: {
      zh: '组合提示、点选、框选、拉索选择和高亮行为。',
      en: 'Combine tooltips, click selection, brush selection, lasso selection, and highlighting.',
    },
  },
  {
    id: 'viewport',
    title: { zh: '视口', en: 'Viewport' },
    description: {
      zh: '控制缩放、聚焦、适配、画布尺寸与坐标转换。',
      en: 'Control zoom, focus, fit, canvas sizing, and coordinate conversion.',
    },
  },
  {
    id: 'extensions',
    title: { zh: '扩展', en: 'Extensions' },
    description: {
      zh: '通过公开注册与扩展 API 定制节点、边、布局、行为和插件。',
      en: 'Customize nodes, edges, layouts, behaviors, and plugins through public extension APIs.',
    },
  },
  {
    id: 'scenarios-and-performance',
    title: { zh: '场景与性能', en: 'Scenarios and performance' },
    description: {
      zh: '使用真实数据和大规模关系网络验证渲染与交互能力。',
      en: 'Validate rendering and interaction with realistic, large relationship networks.',
    },
  },
];

export const siteExamples: readonly SiteExampleDefinition[] = [
  {
    id: 'basic',
    file: 'basic.ts',
    category: 'getting-started',
    group: { zh: '基础图', en: 'Basic graph' },
    title: { zh: '最简关系图', en: 'Minimal graph' },
    description: {
      zh: '使用最少配置渲染一个可缩放、可拖拽的关系图。',
      en: 'Render a zoomable and draggable graph with minimal configuration.',
    },
    interaction: {
      zh: '滚轮缩放，拖拽画布查看不同区域。',
      en: 'Zoom with the wheel and drag the canvas to navigate.',
    },
    dataDescription: {
      zh: '5 个节点和 5 条边组成的最小闭环数据。',
      en: 'A minimal connected dataset with 5 nodes and 5 edges.',
    },
    dataPreview: '{\n  "nodes": 5,\n  "edges": 5,\n  "layout": "circular"\n}',
    tags: ['Graph', 'circular', 'zoom-canvas', 'drag-canvas'],
    metrics: [
      { label: { zh: '节点', en: 'Nodes' }, value: '5' },
      { label: { zh: '边', en: 'Edges' }, value: '5' },
    ],
  },
  {
    id: 'default-theme',
    file: 'default-theme.ts',
    category: 'getting-started',
    group: { zh: '默认体验', en: 'Default experience' },
    title: { zh: '默认主题与交互状态', en: 'Default themes and interaction states' },
    description: {
      zh: '并排检查 light、dark 预设主题，以及节点和边的默认状态表现。',
      en: 'Inspect the light and dark presets together with built-in node and edge states.',
    },
    interaction: {
      zh: '切换节点、边类型或单独查看某个主题，并使用平滑滚轮缩放。',
      en: 'Switch node and edge shapes, isolate one preset, and use smooth wheel zoom.',
    },
    dataDescription: {
      zh: '6 个节点与 6 条边分别承载 default、active、selected、highlight、inactive、disabled 状态。',
      en: 'Six nodes and six edges cover default, active, selected, highlight, inactive, and disabled states.',
    },
    dataPreview:
      '{\n  "themes": ["light", "dark"],\n  "states": ["default", "active", "selected", "highlight", "inactive", "disabled"]\n}',
    tags: ['theme', 'light', 'dark', 'states', 'zoom sensitivity'],
    metrics: [
      { label: { zh: '主题', en: 'Themes' }, value: '2' },
      { label: { zh: '状态', en: 'States' }, value: '6' },
    ],
  },
  {
    id: 'data-mutations',
    file: 'data-mutations.ts',
    category: 'data-and-state',
    group: { zh: '数据生命周期', en: 'Data lifecycle' },
    title: { zh: '节点与边增删改', en: 'Node and edge mutations' },
    description: {
      zh: '集中演示节点和边的单个、批量新增、更新和删除。',
      en: 'Demonstrate individual and batch node and edge additions, updates, and removals.',
    },
    interaction: {
      zh: '使用预览区工具条执行不同的数据变更并观察事件结果。',
      en: 'Use the preview toolbar to perform data mutations and observe event results.',
    },
    dataDescription: {
      zh: '在一份小型业务关系数据上持续执行增量更新。',
      en: 'Apply incremental updates to a small business relationship dataset.',
    },
    dataPreview:
      '{\n  "operations": [\n    "addNode",\n    "updateNode",\n    "removeNode",\n    "addEdge",\n    "updateEdge",\n    "removeEdge"\n  ]\n}',
    tags: ['addNode', 'updateNode', 'removeNode', 'data events'],
    metrics: [{ label: { zh: '操作类型', en: 'Operations' }, value: '6+' }],
  },
  {
    id: 'queries-and-states',
    file: 'queries-and-states.ts',
    category: 'data-and-state',
    group: { zh: '查询与状态', en: 'Queries and states' },
    title: { zh: '查询、批量状态与可见性', en: 'Queries, batch states, and visibility' },
    description: {
      zh: '验证元素、邻接、状态查询，以及批量状态和可见性控制。',
      en: 'Inspect elements, adjacency, and states while controlling batch states and visibility.',
    },
    interaction: {
      zh: '通过工具条运行查询、设置状态、隐藏元素并清理结果。',
      en: 'Run queries, set states, hide elements, and clear results from the toolbar.',
    },
    dataDescription: {
      zh: '使用带邻接关系的数据验证 Graph 查询模型。',
      en: 'Use connected graph data to validate the Graph query model.',
    },
    dataPreview:
      '{\n  "capabilities": [\n    "element queries",\n    "neighbor queries",\n    "batch states",\n    "visibility"\n  ]\n}',
    tags: ['getNodeData', 'neighbors', 'batchSetState', 'visibility'],
    metrics: [{ label: { zh: '能力组', en: 'Capability groups' }, value: '4' }],
  },
  {
    id: 'set-data',
    file: 'set-data.ts',
    category: 'data-and-state',
    group: { zh: '数据替换', en: 'Data replacement' },
    title: { zh: '全量替换数据', en: 'Replace graph data' },
    description: {
      zh: '用 setData 替换整图数据，并在替换后切换布局。',
      en: 'Replace the whole graph with setData, then switch layouts.',
    },
    interaction: {
      zh: '使用工具条替换数据、切换布局、隐藏节点并聚焦。',
      en: 'Replace data, switch layouts, hide a node, and focus it from the toolbar.',
    },
    dataDescription: {
      zh: '工具条会替换整份节点和边，再重新布局。',
      en: 'The toolbar replaces the nodes and edges, then runs layout again.',
    },
    dataPreview:
      '{\n  "operations": [\n    "setData",\n    "setLayout",\n    "hideItem",\n    "focusItem"\n  ]\n}',
    tags: ['data.set', 'layout.runtime', 'state.visibility', 'viewport.focus'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '4' }],
  },
  {
    id: 'search-focus',
    file: 'search-focus.ts',
    category: 'data-and-state',
    group: { zh: '查询', en: 'Queries' },
    title: { zh: '搜索并聚焦', en: 'Search and focus' },
    description: {
      zh: '按名称搜索节点，高亮匹配项并把视口移过去。',
      en: 'Search nodes by name, highlight matches, and move the viewport to them.',
    },
    interaction: {
      zh: '输入名称片段，匹配节点会高亮并移入视口。',
      en: 'Type part of a name to highlight matches and bring them into view.',
    },
    dataDescription: {
      zh: '12 个带名称的节点，按名称片段匹配。',
      en: 'Twelve named nodes are matched by a name fragment.',
    },
    dataPreview:
      '{\n  "nodes": 12,\n  "query": "name substring",\n  "actions": [\n    "highlight",\n    "focusItem"\n  ]\n}',
    tags: ['query.node', 'state.highlight', 'viewport.focus'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '3' }],
  },
  {
    id: 'node-style',
    file: 'node-style.ts',
    category: 'elements',
    group: { zh: '节点', en: 'Nodes' },
    title: { zh: '节点数据映射样式', en: 'Data-driven node styles' },
    description: {
      zh: '按业务字段动态设置节点颜色、尺寸和高亮交互。',
      en: 'Map business fields to node colors, sizes, and highlight interactions.',
    },
    interaction: {
      zh: '悬停节点或边，观察关联高亮。',
      en: 'Hover nodes or edges to inspect relationship highlighting.',
    },
    dataDescription: {
      zh: '节点通过 cluster 字段映射颜色，中心节点使用更大尺寸。',
      en: 'Nodes map the cluster field to color while the hub uses a larger size.',
    },
    dataPreview: '{\n  "nodes": 5,\n  "clusters": ["a", "b"],\n  "style": "functional mapping"\n}',
    tags: ['node.style', 'data mapping', 'highlight-node'],
    metrics: [
      { label: { zh: '节点', en: 'Nodes' }, value: '5' },
      { label: { zh: '分组', en: 'Clusters' }, value: '2' },
    ],
  },
  {
    id: 'shapes',
    file: 'shapes.ts',
    category: 'elements',
    group: { zh: '节点', en: 'Nodes' },
    title: { zh: '图形类型', en: 'Node shapes' },
    description: {
      zh: '并排查看圆形和矩形节点。',
      en: 'Compare circle and rectangle nodes side by side.',
    },
    interaction: {
      zh: '对比上下两张图里的圆形和矩形节点。',
      en: 'Compare circle and rectangle nodes in the two graphs.',
    },
    dataDescription: {
      zh: '两张小图分别使用圆形和矩形节点。',
      en: 'Two small graphs use circle and rectangle nodes.',
    },
    dataPreview: '{\n  "shapes": [\n    "circle",\n    "rect"\n  ]\n}',
    tags: ['node.circle', 'node.rect', 'edge.line'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '3' }],
  },
  {
    id: 'node-border',
    file: 'node-border.ts',
    category: 'elements',
    group: { zh: '节点', en: 'Nodes' },
    title: { zh: '节点边框与圆角', en: 'Node stroke and radius' },
    description: {
      zh: '调整描边、线宽和矩形圆角。',
      en: 'Adjust stroke, width, and rectangle corner radius.',
    },
    interaction: { zh: '查看不同描边宽度和圆角。', en: 'Inspect stroke widths and corner radii.' },
    dataDescription: {
      zh: '矩形节点使用不同线宽和圆角。',
      en: 'Rectangle nodes use different stroke widths and radii.',
    },
    dataPreview:
      '{\n  "strokeWidth": [\n    1,\n    2,\n    4\n  ],\n  "borderRadius": [\n    0,\n    4,\n    8,\n    14\n  ]\n}',
    tags: ['node.stroke', 'node.border-radius'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '2' }],
  },
  {
    id: 'edge-arrows',
    file: 'edge-arrows.ts',
    category: 'elements',
    group: { zh: '边', en: 'Edges' },
    title: { zh: '边与箭头方向', en: 'Edge arrow directions' },
    description: {
      zh: '比较无箭头、单向、双向和粗边箭头。',
      en: 'Compare no-arrow, one-way, bidirectional, and wide-arrow edges.',
    },
    interaction: {
      zh: '直接对照不同边样式和方向表达。',
      en: 'Compare edge direction and width encodings side by side.',
    },
    dataDescription: {
      zh: '4 组边分别映射不同方向和宽度。',
      en: 'Four edge groups map different directions and widths.',
    },
    dataPreview: '{\n  "variants": ["none", "forward", "both", "wide"]\n}',
    tags: ['edge.style', 'startArrow', 'endArrow'],
    metrics: [{ label: { zh: '箭头变体', en: 'Arrow variants' }, value: '4' }],
  },
  {
    id: 'edge-types',
    file: 'edge-types.ts',
    category: 'elements',
    group: { zh: '边', en: 'Edges' },
    title: { zh: '边类型', en: 'Edge types' },
    description: {
      zh: '展示直线、虚线、弧线和曲线。',
      en: 'Show line, dashed, arc, and cubic edges.',
    },
    interaction: {
      zh: '对比直线、虚线、弧线和曲线。',
      en: 'Compare line, dashed, arc, and cubic edges.',
    },
    dataDescription: {
      zh: '四张小图分别展示一种边。',
      en: 'Four small graphs each show one edge type.',
    },
    dataPreview: '{\n  "types": [\n    "line",\n    "lineDash",\n    "arc",\n    "cubic"\n  ]\n}',
    tags: ['edge.line', 'edge.arc', 'edge.cubic', 'edge.dash'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '4' }],
  },
  {
    id: 'edge-colors',
    file: 'edge-colors.ts',
    category: 'elements',
    group: { zh: '边', en: 'Edges' },
    title: { zh: '边颜色', en: 'Edge colors' },
    description: {
      zh: '按业务分类给边映射颜色。',
      en: 'Map edge colors from a business category.',
    },
    interaction: {
      zh: '边颜色来自数据里的分类字段。',
      en: 'Edge color comes from a category field.',
    },
    dataDescription: {
      zh: '边颜色来自数据中的分类序号。',
      en: 'Edge color comes from a category index on the edge.',
    },
    dataPreview: '{\n  "palette": 6,\n  "field": "idx"\n}',
    tags: ['edge.color', 'edge.style-callback'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '2' }],
  },
  {
    id: 'edge-states',
    file: 'edge-states.ts',
    category: 'elements',
    group: { zh: '边', en: 'Edges' },
    title: { zh: '边状态与权重', en: 'Edge states and weight' },
    description: {
      zh: '用权重映射边宽，并查看边的状态样式。',
      en: 'Map edge width from weight and inspect edge state styles.',
    },
    interaction: { zh: '线宽随权重变化。', en: 'Line width follows the weight field.' },
    dataDescription: {
      zh: '边宽由权重字段决定。',
      en: 'Edge width is derived from a weight field.',
    },
    dataPreview: '{\n  "weights": [\n    1,\n    2,\n    3,\n    4\n  ]\n}',
    tags: ['edge.state', 'edge.style-callback'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '2' }],
  },
  {
    id: 'edge-hit-area',
    file: 'edge-hit-area.ts',
    category: 'elements',
    group: { zh: '边', en: 'Edges' },
    title: { zh: '细边交互热区', en: 'Thin-edge hit area' },
    description: {
      zh: '保持细线外观，同时扩大直线、曲线和自环的拾取范围。',
      en: 'Keep a thin stroke while expanding the pick area of lines, curves, and loops.',
    },
    interaction: {
      zh: '把指针移近细边，确认热区比视觉线宽更大。',
      en: 'Move the pointer near a thin edge and see that the hit area is wider than the stroke.',
    },
    dataDescription: {
      zh: '视觉线宽保持很细，命中宽度单独加大。',
      en: 'The visible stroke stays thin while the hit width is larger.',
    },
    dataPreview: '{\n  "lineWidth": 1,\n  "hitAreaWidth": 12\n}',
    tags: ['edge.hit-area', 'edge.picking', 'edge.loop', 'edge.arrow'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '4' }],
  },
  {
    id: 'parallel-edges',
    file: 'parallel-edges.ts',
    category: 'elements',
    group: { zh: '边', en: 'Edges' },
    title: { zh: '平行边与反向边', en: 'Parallel and reverse edges' },
    description: {
      zh: '自动错开同源同目标的多条边、反向边和单边。',
      en: 'Separate same-direction parallel edges, reverse edges, and single edges automatically.',
    },
    interaction: {
      zh: '拖拽节点、悬停和点选边，观察曲线与标签变化。',
      en: 'Drag nodes, hover, and select edges to inspect curves and labels.',
    },
    dataDescription: {
      zh: '4 个节点和 7 条边，包含 6 条平行或反向边。',
      en: 'Four nodes and seven edges, including six parallel or reverse edges.',
    },
    dataPreview: '{\n  "nodes": 4,\n  "edges": 7,\n  "parallelOffset": 26\n}',
    tags: ['process-parallel-edges', 'edge labels', 'reverse edges'],
    metrics: [
      { label: { zh: '节点', en: 'Nodes' }, value: '4' },
      { label: { zh: '边', en: 'Edges' }, value: '7' },
    ],
  },
  {
    id: 'edge-loops',
    file: 'edge-loops.ts',
    category: 'elements',
    group: { zh: '边', en: 'Edges' },
    title: { zh: '自环边', en: 'Self-loop edges' },
    description: {
      zh: '展示一个节点上的单条和多层嵌套自环。',
      en: 'Show one self-loop and several nested loops on a node.',
    },
    interaction: {
      zh: '观察单条自环和叠在一起的多层自环。',
      en: 'Inspect a single loop and several stacked loops.',
    },
    dataDescription: {
      zh: '三个节点分别带有 1、3、5 条自环。',
      en: 'Three nodes have 1, 3, and 5 self-loops.',
    },
    dataPreview: '{\n  "loops": [\n    1,\n    3,\n    5\n  ]\n}',
    tags: ['edge.loop', 'edge.arrow'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '2' }],
  },
  {
    id: 'labels',
    file: 'labels.ts',
    category: 'elements',
    group: { zh: '标签', en: 'Labels' },
    title: { zh: '标签位置与图标', en: 'Label placement and icons' },
    description: {
      zh: '展示节点标签、边标签、图标，并在运行时切换位置。',
      en: 'Show node labels, edge labels, and icons, and change their placement at runtime.',
    },
    interaction: {
      zh: '切换标签位置，或隐藏边标签。',
      en: 'Change label placement or hide edge labels.',
    },
    dataDescription: {
      zh: '节点带图标和标签，边带可开关的标签。',
      en: 'Nodes have icons and labels. Edge labels can be toggled.',
    },
    dataPreview: '{\n  "nodeLabels": true,\n  "edgeLabels": true,\n  "icons": true\n}',
    tags: ['label.node', 'label.edge', 'label.icon', 'options.update'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '4' }],
  },
  {
    id: 'label-rendering-options',
    file: 'label-rendering-options.ts',
    category: 'elements',
    group: { zh: '标签', en: 'Labels' },
    title: { zh: '标签渲染策略', en: 'Label rendering policy' },
    description: {
      zh: '对比固定字号、低缩放持续绘制和关闭碰撞隐藏。',
      en: 'Compare fixed size, low-zoom drawing, and collision hiding.',
    },
    interaction: {
      zh: '切换标签策略，并在不同缩放下比较结果。',
      en: 'Switch the label policy and compare it at different zoom levels.',
    },
    dataDescription: {
      zh: '同一张图在默认策略和全部显示之间切换。',
      en: 'The same graph switches between the default policy and showing every label.',
    },
    dataPreview: '{\n  "hideOnLowZoom": true,\n  "hideOnCollision": true\n}',
    tags: [
      'label.options',
      'label.zoom-scaling',
      'label.low-zoom',
      'label.collision',
      'options.update',
    ],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '5' }],
  },
  {
    id: 'polyline-routing',
    file: 'polyline-routing.ts',
    category: 'elements',
    group: { zh: '边', en: 'Edges' },
    title: { zh: '折线与正交路由', en: 'Polyline orthogonal routing' },
    description: {
      zh: '用圆角正交折线连接从左到右的流程节点。',
      en: 'Connect a left-to-right flow with rounded orthogonal polylines.',
    },
    interaction: {
      zh: '缩放和平移，查看正交折线如何绕开节点。',
      en: 'Zoom and pan to see how orthogonal routes pass around nodes.',
    },
    dataDescription: {
      zh: '5 个矩形节点用正交圆角折线连接。',
      en: 'Five rectangle nodes are connected by rounded orthogonal polylines.',
    },
    dataPreview: '{\n  "edge": "polyline",\n  "router": "orth",\n  "radius": 12\n}',
    tags: ['edge.polyline', 'edge.router'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '2' }],
  },
  {
    id: 'combo',
    file: 'combo.ts',
    category: 'elements',
    group: { zh: 'Combo', en: 'Combos' },
    title: { zh: 'Combo 分组容器', en: 'Combo containers' },
    description: {
      zh: '展示嵌套分组、折叠展开、运行时归组和数据导出。',
      en: 'Explore nested groups, collapse and expand, runtime regrouping, and data export.',
    },
    interaction: {
      zh: '使用工具条折叠分组、移动节点归属、创建分组并导出数据。',
      en: 'Use the toolbar to collapse groups, move memberships, create a combo, and export data.',
    },
    dataDescription: {
      zh: '10 个业务节点、9 条边和 4 个嵌套分组。',
      en: 'Ten business nodes, nine edges, and four nested groups.',
    },
    dataPreview: '{\n  "nodes": 10,\n  "edges": 9,\n  "combos": 4,\n  "runtimeCombo": true\n}',
    tags: ['combo', 'collapse', 'createCombo', 'getData'],
    metrics: [
      { label: { zh: '节点', en: 'Nodes' }, value: '10' },
      { label: { zh: '分组', en: 'Combos' }, value: '4' },
    ],
  },
  {
    id: 'layouts',
    file: 'layouts.ts',
    category: 'layouts',
    group: { zh: '布局切换', en: 'Layout switching' },
    title: { zh: '常用布局切换', en: 'Common layout switching' },
    description: {
      zh: '在同一份数据上切换 circular、force、grid 和 dagre。',
      en: 'Switch between circular, force, grid, and dagre with the same data.',
    },
    interaction: {
      zh: '点击预览区布局按钮，比较四种布局结果。',
      en: 'Use the preview buttons to compare four layout results.',
    },
    dataDescription: {
      zh: '10 个节点和 11 条边组成的层级关系数据。',
      en: 'Hierarchical relationship data with 10 nodes and 11 edges.',
    },
    dataPreview:
      '{\n  "nodes": 10,\n  "edges": 11,\n  "layouts": ["circular", "force", "grid", "dagre"]\n}',
    tags: ['setLayout', 'circular', 'force', 'grid', 'dagre'],
    metrics: [{ label: { zh: '布局', en: 'Layouts' }, value: '4' }],
  },
  {
    id: 'layout-gallery',
    file: 'layout-gallery.ts',
    category: 'layouts',
    group: { zh: '布局矩阵', en: 'Layout gallery' },
    title: { zh: '更多内置布局', en: 'More built-in layouts' },
    description: {
      zh: '比较 radial、concentric、ForceAtlas2、fruchterman、MDS 和 random。',
      en: 'Compare radial, concentric, ForceAtlas2, fruchterman, MDS, and random layouts.',
    },
    interaction: {
      zh: '从工具条选择布局，并观察同一数据的结构变化。',
      en: 'Choose layouts from the toolbar and inspect how the same data changes.',
    },
    dataDescription: {
      zh: '使用固定的小型网络横向比较 6 种布局。',
      en: 'Use a fixed small network to compare six layout algorithms.',
    },
    dataPreview:
      '{\n  "layouts": ["radial", "concentric", "force-atlas2", "fruchterman", "mds", "random"]\n}',
    tags: ['radial', 'concentric', 'force-atlas2', 'fruchterman', 'mds'],
    metrics: [{ label: { zh: '布局', en: 'Layouts' }, value: '6' }],
  },
  {
    id: 'flowchart',
    file: 'flowchart.ts',
    category: 'layouts',
    group: { zh: '流程', en: 'Flows' },
    title: { zh: '流程图', en: 'Flowchart' },
    description: {
      zh: '用层级布局和折线边绘制决策流程。',
      en: 'Draw a decision flow with a hierarchical layout and polyline edges.',
    },
    interaction: { zh: '缩放和平移决策流程。', en: 'Zoom and pan the decision flow.' },
    dataDescription: {
      zh: '决策节点使用 dagre 和折线边。',
      en: 'Decision nodes use dagre and polyline edges.',
    },
    dataPreview: '{\n  "layout": "dagre",\n  "edge": "polyline"\n}',
    tags: ['layout.dagre', 'edge.polyline', 'label.node', 'label.edge'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '4' }],
  },
  {
    id: 'indented-tree',
    file: 'indented-tree.ts',
    category: 'layouts',
    group: { zh: '树', en: 'Trees' },
    title: { zh: '缩进树', en: 'Indented tree' },
    description: {
      zh: '用缩进布局展示目录结构。',
      en: 'Show a directory with the indented layout.',
    },
    interaction: {
      zh: '在样式模式和紧凑模式之间切换。',
      en: 'Switch between the styled and compact modes.',
    },
    dataDescription: {
      zh: '目录节点可以用缩进布局展开成树。',
      en: 'Directory nodes are placed with the indented layout.',
    },
    dataPreview: '{\n  "layout": "indented"\n}',
    tags: ['layout.indented', 'label.canvas'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '2' }],
  },
  {
    id: 'layout-worker',
    file: 'layout-worker.ts',
    category: 'layouts',
    group: { zh: '布局运行', en: 'Layout runtime' },
    title: { zh: 'Worker 布局', en: 'Worker layout' },
    description: {
      zh: '把力导向计算放到 Web Worker，避免挡住主线程。',
      en: 'Run force layout in a Web Worker so the main thread stays responsive.',
    },
    interaction: {
      zh: '等待力导向布局结束后再拖拽画布。',
      en: 'Pan the canvas after the force layout finishes.',
    },
    dataDescription: {
      zh: '80 个节点的力导向布局在 Worker 中计算。',
      en: 'A force layout of 80 nodes runs in a worker.',
    },
    dataPreview: '{\n  "nodes": 80,\n  "layout": "force",\n  "worker": true\n}',
    tags: ['layout.worker', 'layout.force'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '2' }],
  },
  {
    id: 'radial-tree',
    file: 'radial-tree.ts',
    category: 'layouts',
    group: { zh: '树', en: 'Trees' },
    title: { zh: '辐射树', en: 'Radial tree' },
    description: {
      zh: '用辐射布局把一棵主题树铺在中心节点周围。',
      en: 'Place a topic tree around a center node with the radial layout.',
    },
    interaction: {
      zh: '缩放查看中心主题和周围分支。',
      en: 'Zoom to inspect the center topic and its branches.',
    },
    dataDescription: {
      zh: '一棵 10 个节点的主题树围绕根节点排列。',
      en: 'A 10-node topic tree is arranged around its root.',
    },
    dataPreview: '{\n  "nodes": 10,\n  "layout": "radial"\n}',
    tags: ['layout.radial', 'label.node'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '2' }],
  },
  {
    id: 'dependency-graph',
    file: 'dependency-graph.ts',
    category: 'layouts',
    group: { zh: '流程', en: 'Flows' },
    title: { zh: '调用链', en: 'Call graph' },
    description: {
      zh: '用从左到右的层级布局展示服务之间的调用关系。',
      en: 'Show service calls with a left-to-right hierarchical layout.',
    },
    interaction: {
      zh: '悬停服务节点，查看上下游高亮。',
      en: 'Hover a service to highlight its neighbors.',
    },
    dataDescription: {
      zh: '服务节点按调用方向从左向右排列。',
      en: 'Service nodes are ordered from left to right by call direction.',
    },
    dataPreview: '{\n  "layout": "dagre",\n  "rankdir": "LR"\n}',
    tags: ['layout.dagre', 'label.node', 'edge.arrow'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '3' }],
  },
  {
    id: 'relationship',
    file: 'relationship.ts',
    category: 'scenarios-and-performance',
    group: { zh: '关系网络', en: 'Relationship networks' },
    title: { zh: '人物关系网络', en: 'Character relationship network' },
    description: {
      zh: '通过人物节点和关系标签，展示力导布局下的关联网络。',
      en: 'Explore a force-directed network with character nodes and relationship labels.',
    },
    interaction: {
      zh: '缩放或拖拽画布，悬停人物查看关联高亮；点击“适应画布”恢复全图。',
      en: 'Zoom or pan the canvas, hover characters to highlight connections, and fit the full graph.',
    },
    dataDescription: {
      zh: '哈利·波特角色关系示意：8 个人物节点与 10 条带标签的关系边。',
      en: 'An illustrative Harry Potter character network with 8 nodes and 10 labeled edges.',
    },
    dataPreview: '{\n  "nodes": 8,\n  "edges": 10,\n  "layout": "d3-force"\n}',
    tags: ['d3-force', 'label.node', 'label.edge', 'highlight-node'],
    metrics: [
      { label: { zh: '节点', en: 'Nodes' }, value: '8' },
      { label: { zh: '边', en: 'Edges' }, value: '10' },
    ],
  },
  {
    id: 'org-chart',
    file: 'org-chart.ts',
    category: 'scenarios-and-performance',
    group: { zh: '层级图', en: 'Hierarchical graphs' },
    title: { zh: '组织架构图', en: 'Organization chart' },
    description: {
      zh: '使用层级布局、矩形节点和树形连线，展示组织与团队的上下级关系。',
      en: 'Show reporting relationships with hierarchical layout, rectangle nodes, and tree edges.',
    },
    interaction: {
      zh: '缩放或拖拽画布查看组织层级，使用“适应画布”还原完整结构。',
      en: 'Zoom or pan to inspect reporting levels and fit the complete structure.',
    },
    dataDescription: {
      zh: '虚构科技公司的组织示意：6 个岗位 / 团队节点与 5 条层级连线。',
      en: 'An illustrative technology company with 6 role or team nodes and 5 reporting edges.',
    },
    dataPreview: '{\n  "nodes": 6,\n  "edges": 5,\n  "layout": "dagre",\n  "rankdir": "TB"\n}',
    tags: ['dagre', 'node.rect', 'edge.polyline', 'label.node'],
    metrics: [
      { label: { zh: '节点', en: 'Nodes' }, value: '6' },
      { label: { zh: '边', en: 'Edges' }, value: '5' },
    ],
  },
  {
    id: 'mindmap',
    file: 'mindmap.ts',
    category: 'layouts',
    group: { zh: '思维导图', en: 'Mind maps' },
    title: { zh: '思维导图', en: 'Mind map' },
    description: {
      zh: '围绕中心主题展开双向分支，用颜色和文字表达知识层级。',
      en: 'Organize knowledge around a central topic with two-sided, labeled, colored branches.',
    },
    interaction: {
      zh: '缩放或拖拽画布阅读各级主题；使用“适应画布”查看完整脑图。',
      en: 'Zoom or pan to read topic branches and fit the complete mind map.',
    },
    dataDescription: {
      zh: '台风形成因素示意：12 个主题节点与 11 条分支连线。',
      en: 'Illustrative typhoon formation factors with 12 topic nodes and 11 branch edges.',
    },
    dataPreview: '{\n  "nodes": 12,\n  "edges": 11,\n  "layout": "mindmap",\n  "direction": "H"\n}',
    tags: ['mindmap', 'node.rect', 'edge.cubic', 'label.canvas'],
    metrics: [
      { label: { zh: '节点', en: 'Nodes' }, value: '12' },
      { label: { zh: '边', en: 'Edges' }, value: '11' },
    ],
  },
  {
    id: 'fishbone',
    file: 'fishbone.ts',
    category: 'layouts',
    group: { zh: '问题归因', en: 'Cause analysis' },
    title: { zh: '鱼骨图', en: 'Fishbone diagram' },
    description: {
      zh: '将问题、分类与原因组织成鱼骨结构，清晰呈现归因层级。',
      en: 'Organize a problem, categories, and contributing causes into a fishbone structure.',
    },
    interaction: {
      zh: '缩放或拖拽画布阅读各类原因；使用“适应画布”查看完整归因结构。',
      en: 'Zoom or pan to read contributing causes and fit the complete diagram.',
    },
    dataDescription: {
      zh: '盈利未达预期的归因示意：人员、设备、方法等 6 类原因，共 20 个节点与 19 条边。',
      en: 'Illustrative profit shortfall analysis across 6 categories, with 20 nodes and 19 edges.',
    },
    dataPreview: '{\n  "nodes": 20,\n  "edges": 19,\n  "categories": 6,\n  "layout": "fishbone"\n}',
    tags: ['fishbone', 'edge.router', 'node.rect', 'label.canvas'],
    metrics: [
      { label: { zh: '节点', en: 'Nodes' }, value: '20' },
      { label: { zh: '分类', en: 'Categories' }, value: '6' },
    ],
  },
  {
    id: 'tooltip',
    file: 'tooltip.ts',
    category: 'interactions',
    group: { zh: '提示与高亮', en: 'Tooltip and highlighting' },
    title: { zh: 'Tooltip 浮层', en: 'Tooltip' },
    description: {
      zh: '悬停节点或边时展示自定义业务信息。',
      en: 'Show custom business information while hovering nodes or edges.',
    },
    interaction: {
      zh: '悬停节点查看角色，悬停边查看协作关系。',
      en: 'Hover nodes for roles and edges for relationship details.',
    },
    dataDescription: {
      zh: '5 名协作成员和 5 条业务关系。',
      en: 'Five collaborators and five business relationships.',
    },
    dataPreview: '{\n  "nodes": 5,\n  "edges": 5,\n  "tooltipTargets": ["node", "edge"]\n}',
    tags: ['tooltip', 'hover', 'highlight-node', 'highlight-edge'],
    metrics: [{ label: { zh: '提示类型', en: 'Tooltip targets' }, value: '2' }],
  },
  {
    id: 'hover',
    file: 'hover.ts',
    category: 'interactions',
    group: { zh: '悬停', en: 'Hover' },
    title: { zh: '悬停高亮', en: 'Hover highlight' },
    description: {
      zh: '悬停节点或边时高亮关联元素，并淡化其余元素。',
      en: 'Highlight related elements on hover and dim the rest.',
    },
    interaction: {
      zh: '悬停节点或边，关联元素保持清晰，其余元素变淡。',
      en: 'Hover a node or edge. Related elements stay clear and the rest dim.',
    },
    dataDescription: {
      zh: '星形关系图用于观察悬停后的淡化效果。',
      en: 'A hub-and-spoke graph shows the dimmed hover treatment.',
    },
    dataPreview: '{\n  "behavior": "hover-highlight",\n  "inactiveState": "inactive"\n}',
    tags: ['behavior.hover-highlight', 'event.pointer'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '2' }],
  },
  {
    id: 'neighbor-highlight',
    file: 'neighbor-highlight.ts',
    category: 'interactions',
    group: { zh: '悬停', en: 'Hover' },
    title: { zh: '一度邻居高亮', en: 'One-hop highlight' },
    description: {
      zh: '悬停节点高亮邻居和连边，悬停边高亮两端节点。',
      en: 'Highlight a node with its neighbors, or an edge with its endpoints.',
    },
    interaction: { zh: '悬停节点或边。', en: 'Hover a node or an edge.' },
    dataDescription: {
      zh: '中心节点和一层分支用于观察邻居高亮。',
      en: 'A center node and one ring of branches show neighbor highlighting.',
    },
    dataPreview: '{\n  "behaviors": [\n    "highlight-node",\n    "highlight-edge"\n  ]\n}',
    tags: ['behavior.highlight-node', 'behavior.highlight-edge'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '2' }],
  },
  {
    id: 'selection-behaviors',
    file: 'selection-behaviors.ts',
    category: 'interactions',
    group: { zh: '选择', en: 'Selection' },
    title: { zh: '点选、框选与拉索选择', en: 'Click, brush, and lasso selection' },
    description: {
      zh: '在同一示例中比较 click、brush 和 lasso 选择行为。',
      en: 'Compare click, brush, and lasso selection behaviors in one example.',
    },
    interaction: {
      zh: '切换选择模式后，在画布中点选、框选或绘制拉索。',
      en: 'Switch selection modes, then click, brush, or draw a lasso on the canvas.',
    },
    dataDescription: {
      zh: '规则分布的节点用于观察不同选择范围。',
      en: 'Regularly distributed nodes make different selection ranges easy to compare.',
    },
    dataPreview: '{\n  "behaviors": ["click-select", "brush-select", "lasso-select"]\n}',
    tags: ['click-select', 'brush-select', 'lasso-select'],
    metrics: [{ label: { zh: '选择方式', en: 'Selection modes' }, value: '3' }],
  },
  {
    id: 'drag-node',
    file: 'drag-node.ts',
    category: 'interactions',
    group: { zh: '拖拽', en: 'Dragging' },
    title: { zh: '拖拽节点与 Combo', en: 'Drag nodes and combos' },
    description: {
      zh: '拖拽单个节点，或拖拽 Combo 背景带动其中的节点。',
      en: 'Drag a node, or drag a combo background to move its nodes.',
    },
    interaction: {
      zh: '拖拽节点改变位置，拖拽 Combo 空白处移动整组。',
      en: 'Drag a node to move it, or drag empty combo space to move the group.',
    },
    dataDescription: {
      zh: '一个 Combo 包住两个客户端节点，旁边是独立服务节点。',
      en: 'A combo contains two client nodes beside standalone service nodes.',
    },
    dataPreview: '{\n  "nodes": 5,\n  "combos": 1,\n  "behavior": "drag-node"\n}',
    tags: ['behavior.drag-node', 'combo.drag'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '2' }],
  },
  {
    id: 'drag-edge',
    file: 'drag-edge.ts',
    category: 'interactions',
    group: { zh: '拖拽', en: 'Dragging' },
    title: { zh: '拖拽边端点', en: 'Drag edge endpoints' },
    description: {
      zh: '把边的端点拖到另一个节点上，完成重新连线。',
      en: 'Drag an edge endpoint onto another node to reconnect it.',
    },
    interaction: {
      zh: '按住边靠近端点的位置，拖到另一个节点上松开。',
      en: 'Drag near an endpoint and release it on another node.',
    },
    dataDescription: {
      zh: '两条带端点的边可以拖到其他节点上。',
      en: 'Two edges can be dragged onto another node.',
    },
    dataPreview:
      '{\n  "edges": [\n    "editable-edge",\n    "reference-edge"\n  ],\n  "behavior": "drag-edge"\n}',
    tags: ['behavior.drag-edge', 'event.edge-drag', 'data.edge-update'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '3' }],
  },
  {
    id: 'event-log',
    file: 'event-log.ts',
    category: 'interactions',
    group: { zh: '事件', en: 'Events' },
    title: { zh: '事件面板', en: 'Event log' },
    description: {
      zh: '点击、拖拽和选择节点时，查看 Graph 发出的公开事件。',
      en: 'Inspect the public events emitted by click, drag, and selection.',
    },
    interaction: {
      zh: '点击或拖拽节点，左下角列出最近的事件。',
      en: 'Click or drag a node and read the latest events.',
    },
    dataDescription: {
      zh: '四个节点同时启用点击选择和拖拽。',
      en: 'Four nodes enable click selection and dragging together.',
    },
    dataPreview:
      '{\n  "events": [\n    "node:click",\n    "node:dragend",\n    "node:selectchange"\n  ]\n}',
    tags: ['event.pointer', 'event.drag', 'event.selection'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '3' }],
  },
  {
    id: 'context-menu',
    file: 'context-menu.ts',
    category: 'interactions',
    group: { zh: '事件', en: 'Events' },
    title: { zh: '右键菜单', en: 'Context menu' },
    description: {
      zh: '在节点上打开右键菜单，执行聚焦或高亮。',
      en: 'Open a node context menu to focus or highlight it.',
    },
    interaction: {
      zh: '在节点上右键，选择聚焦或高亮。',
      en: 'Right-click a node, then focus or highlight it.',
    },
    dataDescription: {
      zh: '三个流程节点响应 node:contextmenu。',
      en: 'Three flow nodes listen for node:contextmenu.',
    },
    dataPreview:
      '{\n  "event": "node:contextmenu",\n  "actions": [\n    "focusItem",\n    "selected"\n  ]\n}',
    tags: ['event.contextmenu', 'viewport.focus', 'state.selected'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '3' }],
  },
  {
    id: 'viewport-controls',
    file: 'viewport-controls.ts',
    category: 'viewport',
    group: { zh: '画布与坐标', en: 'Canvas and coordinates' },
    title: { zh: '视口与坐标转换', en: 'Viewport and coordinate conversion' },
    description: {
      zh: '验证 camera、fit、zoom、focus、resize 和屏幕/图坐标互转。',
      en: 'Validate camera, fit, zoom, focus, resize, and screen/graph coordinate conversion.',
    },
    interaction: {
      zh: '通过工具条执行视口操作，并观察坐标与尺寸结果。',
      en: 'Run viewport operations from the toolbar and inspect coordinates and dimensions.',
    },
    dataDescription: {
      zh: '固定坐标节点用于验证视口和坐标 API。',
      en: 'Fixed-position nodes make viewport and coordinate APIs observable.',
    },
    dataPreview:
      '{\n  "capabilities": ["fitView", "zoomTo", "focusElement", "resize", "screenToGraph"]\n}',
    tags: ['fitView', 'zoomTo', 'focusElement', 'resize', 'coordinates'],
    metrics: [{ label: { zh: '视口能力', en: 'Viewport capabilities' }, value: '5+' }],
  },
  {
    id: 'zoom-options',
    file: 'zoom-options.ts',
    category: 'viewport',
    group: { zh: '缩放', en: 'Zoom' },
    title: { zh: '缩放范围与灵敏度', en: 'Zoom range and sensitivity' },
    description: {
      zh: '把滚轮缩放限制在指定灵敏度和最小、最大比例之间。',
      en: 'Limit wheel zoom with sensitivity, minimum zoom, and maximum zoom.',
    },
    interaction: {
      zh: '滚动缩放，或把视口设到最小、1 倍和最大比例。',
      en: 'Zoom with the wheel, or jump to the minimum, 1x, and maximum zoom.',
    },
    dataDescription: {
      zh: '滚轮缩放被限制在 0.4 到 2 之间。',
      en: 'Wheel zoom is limited to the range 0.4–2.',
    },
    dataPreview: '{\n  "sensitivity": 1.4,\n  "minZoom": 0.4,\n  "maxZoom": 2\n}',
    tags: ['behavior.zoom-canvas-options'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '1' }],
  },
  {
    id: 'extension-system',
    file: 'extension-system.ts',
    category: 'extensions',
    group: { zh: '公开扩展 API', en: 'Public extension APIs' },
    title: { zh: '扩展系统综合示例', en: 'Extension system showcase' },
    description: {
      zh: '组合验证 decoration、edge、layout、transform、behavior 和 plugin 扩展。',
      en: 'Combine decoration, edge, layout, transform, behavior, and plugin extensions.',
    },
    interaction: {
      zh: '点击节点切换大小，悬停 ··· 展开被收起的徽章。',
      en: 'Click a node to change its size, and hover ··· to expand hidden badges.',
    },
    dataDescription: {
      zh: '小型关系数据用于集中展示六类公开扩展点。',
      en: 'A small graph demonstrates six categories of public extension points.',
    },
    dataPreview:
      '{\n  "extensions": ["decoration", "edge", "layout", "transform", "behavior", "plugin"]\n}',
    tags: ['register', 'decoration', 'layout extension', 'behavior', 'plugin'],
    metrics: [{ label: { zh: '扩展类型', en: 'Extension types' }, value: '6' }],
  },
  {
    id: 'breathing-node',
    file: 'breathing-node.ts',
    category: 'extensions',
    group: { zh: '节点扩展', en: 'Node extensions' },
    title: { zh: '呼吸节点', en: 'Breathing node' },
    description: {
      zh: '用自定义节点动画表现选中和高亮状态。',
      en: 'Show selected and highlight states with a custom node animation.',
    },
    interaction: {
      zh: '切换选中和高亮，观察节点动画。',
      en: 'Toggle selected and highlight to see the node animation.',
    },
    dataDescription: {
      zh: '一个自定义节点响应选中和高亮。',
      en: 'One custom node responds to selected and highlight.',
    },
    dataPreview: '{\n  "states": [\n    "selected",\n    "highlight"\n  ]\n}',
    tags: ['extension.node', 'state.selected', 'state.highlight'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '3' }],
  },
  {
    id: 'custom-label-renderer',
    file: 'custom-label-renderer.ts',
    category: 'extensions',
    group: { zh: '标签扩展', en: 'Label extensions' },
    title: { zh: '自定义标签渲染', en: 'Custom label renderer' },
    description: {
      zh: '节点和边共用一个自定义 Label Renderer。',
      en: 'Share one custom label renderer between nodes and edges.',
    },
    interaction: {
      zh: '查看节点和边上的多行自定义标签。',
      en: 'Inspect the custom multiline labels on nodes and edges.',
    },
    dataDescription: {
      zh: '节点和边使用同一个多行标签渲染器。',
      en: 'Nodes and edges share one multiline label renderer.',
    },
    dataPreview: '{\n  "renderer": "demo-multiline"\n}',
    tags: ['extension.label', 'label.custom'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '2' }],
  },
  {
    id: 'custom-node-extension',
    file: 'g6-v5-compat.ts',
    category: 'extensions',
    group: { zh: '节点扩展', en: 'Node extensions' },
    title: { zh: '自定义节点与显式边 ID', en: 'Custom nodes and explicit edge IDs' },
    description: {
      zh: '注册自定义节点，并使用显式边 ID 与 Combo 状态。',
      en: 'Register a custom node and use explicit edge IDs with combo state.',
    },
    interaction: {
      zh: '点击边或 Combo，查看显式 ID 和状态。',
      en: 'Click an edge or combo to inspect its explicit ID and state.',
    },
    dataDescription: {
      zh: '自定义节点、显式边 ID 和 Combo 放在同一张图里。',
      en: 'A custom node, explicit edge IDs, and a combo share one graph.',
    },
    dataPreview: '{\n  "edgeId": "edge-worker-a-store",\n  "combo": "demo-combo"\n}',
    tags: ['extension.node', 'edge.explicit-id', 'combo.state'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '3' }],
  },
  {
    id: 'custom-behavior',
    file: 'custom-behavior.ts',
    category: 'extensions',
    group: { zh: '行为扩展', en: 'Behavior extensions' },
    title: { zh: '注册自定义 Behavior', en: 'Register a custom behavior' },
    description: {
      zh: '注册一个 Behavior：点击节点时选中它，点击画布时清除。',
      en: 'Register a behavior that selects a clicked node and clears selection on the canvas.',
    },
    interaction: {
      zh: '点击节点选中它，点击空白画布清除选中。',
      en: 'Click a node to select it, or click empty canvas to clear the selection.',
    },
    dataDescription: {
      zh: '四个流程节点由自定义 pin-node Behavior 选中。',
      en: 'Four flow nodes are selected by the custom pin-node behavior.',
    },
    dataPreview: '{\n  "behavior": "pin-node"\n}',
    tags: ['extension.behavior'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '1' }],
  },
  {
    id: 'custom-layout',
    file: 'custom-layout.ts',
    category: 'extensions',
    group: { zh: '布局扩展', en: 'Layout extensions' },
    title: { zh: '自定义布局', en: 'Custom layout' },
    description: {
      zh: '注册一个把节点排成两行的布局扩展。',
      en: 'Register a layout extension that places nodes in two rows.',
    },
    interaction: {
      zh: '查看由自定义布局算出的两行坐标。',
      en: 'Inspect the two-row positions produced by the custom layout.',
    },
    dataDescription: {
      zh: '六个流程节点由 two-row 布局排成两行。',
      en: 'Six flow nodes are placed in two rows by the two-row layout.',
    },
    dataPreview: '{\n  "layout": "two-row",\n  "nodes": 6\n}',
    tags: ['extension.layout'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '1' }],
  },
  {
    id: 'decoration-badges',
    file: 'decoration-badges.ts',
    category: 'extensions',
    group: { zh: '装饰', en: 'Decorations' },
    title: { zh: '节点徽章', en: 'Node badges' },
    description: {
      zh: '在节点边界堆叠计数、状态和文本徽章。',
      en: 'Stack count, status, and text badges on a node boundary.',
    },
    interaction: {
      zh: '悬停超出数量的徽章入口，展开被收起的徽章。',
      en: 'Hover the overflow marker to expand hidden badges.',
    },
    dataDescription: {
      zh: '三个节点在边界上堆叠内置徽章。',
      en: 'Three nodes stack built-in badges on their boundary.',
    },
    dataPreview: '{\n  "renderer": "builtin-badge",\n  "overflow": "hover-expand"\n}',
    tags: ['extension.decoration', 'decoration.badge'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '2' }],
  },
  {
    id: 'real-dataset',
    file: 'real-dataset.ts',
    category: 'scenarios-and-performance',
    group: { zh: '真实数据集', en: 'Real datasets' },
    title: { zh: 'AI Papers 大规模关系图', en: 'AI Papers large relationship graph' },
    description: {
      zh: '使用真实论文引用网络验证大图渲染和交互链路。',
      en: 'Validate large-graph rendering and interaction with a real paper citation network.',
    },
    interaction: {
      zh: '缩放、拖拽画布并悬停节点，观察大规模关系图的交互表现。',
      en: 'Zoom, pan, and hover nodes to inspect interaction on a large relationship graph.',
    },
    dataDescription: {
      zh: 'AI Papers 数据包含 8,798 个节点和 71,077 条边，复用预计算 ForceAtlas2 坐标。',
      en: 'The AI Papers dataset contains 8,798 nodes and 71,077 edges with precomputed ForceAtlas2 coordinates.',
    },
    dataPreview:
      '{\n  "dataset": "AI Papers",\n  "nodes": 8798,\n  "edges": 71077,\n  "layout": "precomputed ForceAtlas2 positions"\n}',
    tags: ['real dataset', 'large graph', 'WebGL', 'highlight-node'],
    metrics: [
      { label: { zh: '节点', en: 'Nodes' }, value: '8,798' },
      { label: { zh: '边', en: 'Edges' }, value: '71,077' },
    ],
  },
  {
    id: 'large',
    file: 'large.ts',
    category: 'scenarios-and-performance',
    group: { zh: '规模', en: 'Scale' },
    title: { zh: '200 节点', en: '200 nodes' },
    description: {
      zh: '用 200 个节点快速查看中等规模图的渲染和交互。',
      en: 'Inspect rendering and interaction on a 200-node graph.',
    },
    interaction: {
      zh: '缩放、拖拽，并悬停节点查看邻居高亮。',
      en: 'Zoom, pan, and hover a node to highlight its neighbors.',
    },
    dataDescription: {
      zh: '合成网络包含 200 个节点，每个节点约 4 条边。',
      en: 'The synthetic network has 200 nodes and about 4 edges each.',
    },
    dataPreview: '{\n  "nodes": 200,\n  "edgeFactor": 4,\n  "layout": "force"\n}',
    tags: ['scale.synthetic-medium', 'graph.render'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '2' }],
  },
  {
    id: 'large-labeled',
    file: 'large-labeled.ts',
    category: 'scenarios-and-performance',
    group: { zh: '规模', en: 'Scale' },
    title: { zh: '5000 节点与标签', en: '5,000 labeled nodes' },
    description: {
      zh: '在 5000 个节点上绘制 Canvas 标签。',
      en: 'Draw canvas labels on a 5,000-node graph.',
    },
    interaction: {
      zh: '缩小查看全图，放大后再阅读节点标签。',
      en: 'Zoom out for the whole graph, then zoom in to read labels.',
    },
    dataDescription: {
      zh: '合成网络包含 5000 个节点，并绘制节点标签。',
      en: 'The synthetic network has 5,000 nodes and draws node labels.',
    },
    dataPreview: '{\n  "nodes": 5000,\n  "labels": true,\n  "layout": "force"\n}',
    tags: ['scale.synthetic-large', 'label.canvas'],
    metrics: [{ label: { zh: '能力', en: 'Capabilities' }, value: '2' }],
  },
];
const exampleById = new Map(siteExamples.map((example) => [example.id, example]));

export function localizedText(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

export function getSiteExample(id: string): SiteExampleDefinition | undefined {
  return exampleById.get(id);
}

export function getExamplesByCategory(category: SiteExampleCategoryId): SiteExampleDefinition[] {
  return siteExamples.filter((example) => example.category === category);
}

export function localizedExamplePath(id: string, locale: Locale): string {
  return localizedPath(`/docs/examples/${id}`, locale);
}
