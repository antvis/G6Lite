import type { Locale } from '@/lib/i18n';

const zh = {
  hero: {
    before: '轻量图可视化，',
    prefix: '为',
    highlight: '大规模关系数据',
    after: '而生',
    description:
      '丰富的布局与交互能力，配合轻量、高效的 WebGL 渲染，帮助你更轻松地呈现和探索复杂关系。',
  },
  actions: {
    start: '快速开始',
    ai: '用 AI 构建',
    examples: '查看示例',
    github: '查看 GitHub',
    readStart: '阅读快速开始',
  },
  workflow: {
    title: '从关系数据，到可交互的图',
    description: '基于统一的数据模型与配置接口，覆盖数据接入、布局计算、图形渲染和交互控制。',
    lifecycle: '了解图的生命周期',
    stages: [
      { title: '接入数据', description: '用节点、边与分组，描述真实业务关系。' },
      { title: '组织布局', description: '按图结构选择算法，让关系各就其位。' },
      { title: '高效渲染', description: 'WebGL 绘制图形，Canvas 承载文本信息。' },
      { title: '流畅交互', description: '缩放、拖拽与高亮，沿增量链路及时反馈。' },
    ],
    layers: ['Canvas · 标签信息', 'WebGL · 节点与边', 'Canvas · Combo 分组'],
  },
  performance: {
    title: '轻量加载，流畅交互',
    description: '按需加载降低初始开销，WebGL 批量绘制支撑复杂关系渲染，按变化类型处理交互更新。',
    loadTitle: '轻量加载',
    loadDescription: '核心入口与布局算法分离，按需加载所选布局，降低初始化阶段的加载开销。',
    measured: '初始入口实测',
    noLayouts: '未加载布局',
    core: '核心入口',
    lazyLayouts: '布局按需加载',
    sizeLink: '查看体积测量口径',
    batchTitle: '批量渲染',
    batchDescription:
      '同类节点与边进入 WebGL 绘制批次，利用 GPU 处理图形数据，支撑复杂关系网络的可视化。',
    nodes: '节点数据',
    edges: '边数据',
    batches: '绘制批次',
    batchCaption: '渲染机制示意 · 同类图形归入对应批次',
    architectureLink: '了解图渲染架构',
    updateTitle: '按需更新',
    updateDescription:
      '交互时复用已有布局，分别处理视口、节点位置与状态变化，减少不必要的重复计算。',
    tuning: '查看交互性能调优',
    footnote: '实际加载体积与交互表现取决于构建方式、数据和设备。',
    method: '查看性能验证方法',
  },
  update: {
    group: '切换交互更新示意',
    illustration: '更新机制示意，非实时性能测试',
    caption: '交互机制示意 · 更新方式随变化类型而定',
    scenarios: [
      { label: '高亮', detail: '状态变化，更新节点与邻接关系的颜色' },
      { label: '移动', detail: '位置变化，更新节点及关联边的位置' },
      { label: '缩放', detail: '视口变化，更新相机参数并重新绘制' },
    ],
  },
  examples: {
    title: '精选示例',
    description: '通过关系网络、层级图、脑图与鱼骨图，查看不同类型的图可视化效果。',
    entry: '查看示例',
    screenshot: '实时示例截图',
    open: '查看',
    openSuffix: '示例',
    items: [
      { title: '关系网络', description: '用人物与关系标签，呈现实体关联。' },
      { title: '层级图', description: '展示组织与团队的上下级关系。' },
      { title: '脑图', description: '围绕中心主题，展开知识分支。' },
      { title: '鱼骨图', description: '按类别梳理原因，呈现归因结构。' },
    ],
  },
  developer: {
    label: '开发接入',
    first: '快速接入，',
    second: '灵活定制',
    description:
      '将关系图集成到现有 Web 应用，根据业务需求配置布局、交互与样式，并通过数据更新接口保持图与业务数据同步。',
    codeLabel: 'TypeScript 快速接入示例',
  },
  architecture: {
    title: '分层架构，协同渲染',
    description:
      'Graph 协同组织数据管理、布局计算与交互控制。WebGL 批量绘制节点与边，Canvas 2D 承载标签、图标与分组边界，各图层共享视口与更新调度。',
    link: '查看完整架构',
    figure: 'G6Lite 分层架构与协同绘制图层',
    rows: ['使用方', '公开入口', '内部职责', '协同绘制'],
    consumer: '业务应用',
    api: '数据 · 布局 · 状态 · 视口 · 扩展',
    responsibilities: [
      { title: '数据模型', description: '节点、边、分组与状态' },
      { title: '布局计算', description: '按需选择算法，计算坐标' },
      { title: '交互控制', description: '画布事件、行为与命中反馈' },
      { title: '渲染调度', description: '按变更类型安排更新' },
    ],
    layerNames: ['上层', '主画布', '底层'],
    layerDetails: ['标签与图标', '节点与边 · 按需拾取', 'Combo 分组边界'],
    caption: '图层按叠加位置排列，共享视口与更新调度；内部模块不属于公开 API。',
  },
  cta: {
    title: '开始使用 G6Lite',
    description: '阅读接入指南，构建可交互的关系图；查看源码，了解实现细节与扩展方式。',
  },
  footer: {
    description: '轻量、高性能的 WebGL 图可视化引擎。',
    home: '返回首页',
    groups: ['产品', '开发者', '开源社区', 'AntV 生态'],
    product: ['核心能力', '精选示例', 'AI 构建'],
    developer: ['文档', '快速开始', 'API'],
    community: ['GitHub', '问题反馈', '更新记录'],
  },
  graph: {
    region: '可交互的 Wikipedia 数据可视化关系网络',
    loading: '正在加载关系图',
    error: '关系图暂时无法加载',
    errorHint: '请检查网络或浏览器的 WebGL 支持',
    retry: '重新加载',
    toolbar: '关系图视口控制',
    fit: '适配画布',
    zoomIn: '放大关系图',
    zoomInTitle: '放大',
    zoomOut: '缩小关系图',
    zoomOutTitle: '缩小',
    nodes: '个节点',
    edges: '条关系',
    instructions:
      '鼠标可拖动画布和节点，悬停高亮；触屏可单指平移、双指缩放，触控板可捏合缩放。画布外可滚动页面。',
  },
};

const en: typeof zh = {
  hero: {
    before: 'A lightweight engine',
    prefix: 'for ',
    highlight: 'large-scale graphs',
    after: '',
    description:
      'Visualize complex relationships with flexible layouts, responsive interactions, and efficient WebGL rendering.',
  },
  actions: {
    start: 'Quick start',
    ai: 'Build with AI',
    examples: 'Examples',
    github: 'View on GitHub',
    readStart: 'Read the quick start',
  },
  workflow: {
    title: 'Your data, made interactive',
    description:
      'Define nodes and edges, choose a layout, and add the interactions your application needs.',
    lifecycle: 'Explore the graph lifecycle',
    stages: [
      {
        title: 'Add your data',
        description: 'Describe connections with nodes, edges, and groups.',
      },
      {
        title: 'Choose a layout',
        description: 'Choose a layout that reflects the structure of your data.',
      },
      {
        title: 'Render your graph',
        description: 'Draw nodes and edges with WebGL and labels with Canvas 2D.',
      },
      {
        title: 'Add interaction',
        description: 'Let users zoom, drag, and highlight connections with incremental updates.',
      },
    ],
    layers: ['Canvas · Labels', 'WebGL · Nodes and edges', 'Canvas · Combo groups'],
  },
  performance: {
    title: 'A small core, responsive interactions',
    description:
      'Load layouts only when needed, render elements in batches, and handle changes without unnecessary recomputation.',
    loadTitle: 'Lightweight loading',
    loadDescription: 'Layout algorithms load on demand, keeping the initial core bundle small.',
    measured: 'Measured entry size',
    noLayouts: 'Layouts excluded',
    core: 'Core entry',
    lazyLayouts: 'On-demand layouts',
    sizeLink: 'How we measure bundle size',
    batchTitle: 'Batch rendering',
    batchDescription:
      'The engine groups similar nodes and edges into WebGL draw batches for efficient rendering.',
    nodes: 'Node data',
    edges: 'Edge data',
    batches: 'Draw batches',
    batchCaption: 'Illustration · Similar elements share draw batches',
    architectureLink: 'Explore the rendering architecture',
    updateTitle: 'Targeted updates',
    updateDescription:
      'Respond to state, position, and viewport changes without recalculating the layout unnecessarily.',
    tuning: 'Tune interaction performance',
    footnote:
      'Actual bundle size and interaction performance vary with your build, data, and device.',
    method: 'Explore performance testing',
  },
  update: {
    group: 'Explore update behavior',
    illustration: 'update illustration, not a live performance test',
    caption: 'Illustration · Each change follows its own update path',
    scenarios: [
      {
        label: 'Highlight',
        detail: 'Update a node and its connections when its state changes',
      },
      { label: 'Move', detail: 'Update node and edge positions as the node moves' },
      { label: 'Zoom', detail: 'Update the camera and redraw as the viewport changes' },
    ],
  },
  examples: {
    title: 'Examples',
    description:
      'Explore networks, hierarchies, mind maps, and fishbone diagrams, each with a live demo and source code.',
    entry: 'View example',
    screenshot: 'live example screenshot',
    open: 'View ',
    openSuffix: ' example',
    items: [
      {
        title: 'Network',
        description: 'Show how people and entities connect.',
      },
      { title: 'Hierarchy', description: 'Make reporting relationships easy to follow.' },
      {
        title: 'Mind map',
        description: 'Build out ideas around a central topic.',
      },
      {
        title: 'Fishbone',
        description: 'Organize the causes behind a problem.',
      },
    ],
  },
  developer: {
    label: 'Developer integration',
    first: 'Fits your app,',
    second: 'adapts to your needs',
    description:
      'Add G6Lite to your web app, then tailor layouts, interactions, and styles to your use case. Update the graph as your data changes.',
    codeLabel: 'TypeScript quick-start example',
  },
  architecture: {
    title: 'Layers that work as one',
    description:
      'Graph manages data, layouts, and interactions. WebGL renders nodes and edges, while Canvas 2D draws labels, icons, and group boundaries. A shared viewport and scheduler keep the layers aligned.',
    link: 'Explore the full architecture',
    figure: 'G6Lite architecture and coordinated rendering layers',
    rows: ['Applications', 'Public API', 'Internals', 'Rendering'],
    consumer: 'Your application',
    api: 'Data · Layout · State · Viewport · Extensions',
    responsibilities: [
      { title: 'Data model', description: 'Nodes, edges, groups, and states' },
      { title: 'Layout', description: 'Load algorithms and compute positions' },
      { title: 'Interaction', description: 'Canvas events, behaviors, and picking' },
      { title: 'Scheduling', description: 'Schedule updates by change type' },
    ],
    layerNames: ['Overlay', 'Main', 'Underlay'],
    layerDetails: [
      'Labels and icons',
      'Nodes and edges · On-demand picking',
      'Combo group boundaries',
    ],
    caption:
      'Layers share a viewport and update scheduling. Internal modules are implementation details, not public APIs.',
  },
  cta: {
    title: 'Get started with G6Lite',
    description:
      'Get your first graph on screen with the quick-start guide, or explore the source on GitHub.',
  },
  footer: {
    description: 'A lightweight WebGL engine for interactive graphs',
    home: 'Back to home',
    groups: ['Product', 'Developers', 'Community', 'AntV ecosystem'],
    product: ['Core capabilities', 'Examples', 'Build with AI'],
    developer: ['Docs', 'Quick start', 'API'],
    community: ['GitHub', 'Report an issue', 'Changelog'],
  },
  graph: {
    region: 'Interactive relationship network from the Wikipedia dataset',
    loading: 'Loading graph',
    error: 'The graph could not be loaded',
    errorHint: 'Check your connection and make sure your browser supports WebGL.',
    retry: 'Retry',
    toolbar: 'Graph viewport controls',
    fit: 'Fit graph',
    zoomIn: 'Zoom in on graph',
    zoomInTitle: 'Zoom in',
    zoomOut: 'Zoom out of graph',
    zoomOutTitle: 'Zoom out',
    nodes: 'nodes',
    edges: 'edges',
    instructions:
      'Drag nodes or the canvas to explore the graph. Hover to highlight connections. Pinch to zoom on touch screens and trackpads; scroll outside the graph to move through the page.',
  },
};

export const homepageCopy: Record<Locale, typeof zh> = { zh, en };
