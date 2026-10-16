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
