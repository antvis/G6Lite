import type { Locale } from './i18n';

export type AiWorkspaceMode = 'create' | 'qa';
export type MockGraphLayout = 'horizontal' | 'vertical' | 'radial';
export type MockGraphTheme = 'blue' | 'purple' | 'green' | 'red';
export type MockGraphTemplate = 'business' | 'generic' | 'knowledge' | 'organization' | 'services';
export type MockNodeGroup = 'primary' | 'secondary' | 'accent' | 'neutral';

export type MockGraphNode = {
  id: string;
  label: string;
  group: MockNodeGroup;
  level: number;
};

export type MockGraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
};

export type MockGraph = {
  template: MockGraphTemplate;
  title: string;
  summary: string;
  layout: MockGraphLayout;
  theme: MockGraphTheme;
  showLabels: boolean;
  nodes: MockGraphNode[];
  edges: MockGraphEdge[];
};

export type MockGenerationResult = {
  graph: MockGraph;
  reply: string;
};

export type MockCase = {
  id: string;
  mode: AiWorkspaceMode;
  template: MockGraphTemplate;
  title: string;
  description: string;
  prompt: string;
};

export type G6LiteGraphData = {
  nodes: Array<{
    id: string;
    data: { label: string; group: MockNodeGroup; level: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    data: { label: string };
  }>;
};

export type G6LiteLayoutConfig =
  | { type: 'circular'; radius: number }
  | {
      type: 'dagre';
      rankdir: 'LR' | 'TB';
      nodesep: number;
      ranksep: number;
      nodeSize: [number, number];
    };

export const mockThemeColors: Record<
  MockGraphTheme,
  { primary: string; secondary: string; accent: string; neutral: string; edge: string }
> = {
  blue: {
    primary: '#2563eb',
    secondary: '#60a5fa',
    accent: '#06b6d4',
    neutral: '#dbeafe',
    edge: '#7c9fd6',
  },
  purple: {
    primary: '#675cf5',
    secondary: '#9b8cff',
    accent: '#ec4899',
    neutral: '#ede9fe',
    edge: '#9a91d7',
  },
  green: {
    primary: '#0f9f75',
    secondary: '#34d399',
    accent: '#84cc16',
    neutral: '#d1fae5',
    edge: '#6eae9c',
  },
  red: {
    primary: '#e5484d',
    secondary: '#fb7185',
    accent: '#f59e0b',
    neutral: '#fee2e2',
    edge: '#d38a8d',
  },
};

const cases: Record<Locale, MockCase[]> = {
  zh: [
    {
      id: 'business-entities',
      mode: 'create',
      template: 'business',
      title: '用户、订单与商品关系图',
      description: '识别业务实体与动作关系，生成从左到右的分层图。',
      prompt: '绘制用户、订单和商品之间的关系图：用户创建订单，订单包含多个商品。',
    },
    {
      id: 'organization-tree',
      mode: 'create',
      template: 'organization',
      title: '组织架构图',
      description: '按部门和岗位生成清晰的上下层级结构。',
      prompt: '绘制一个组织架构图，包含公司、研发部、产品部、运营部以及各部门负责人。',
    },
    {
      id: 'service-topology',
      mode: 'create',
      template: 'services',
      title: '服务依赖拓扑',
      description: '展示网关、业务服务与基础设施之间的调用关系。',
      prompt: '绘制微服务依赖拓扑，包含 API 网关、认证、订单、支付、库存、消息队列和数据库。',
    },
    {
      id: 'g6lite-migration',
      mode: 'qa',
      template: 'knowledge',
      title: 'G6Lite 能力答疑',
      description: '用关系网络梳理数据、布局、渲染、交互和扩展边界。',
      prompt: 'G6Lite 的数据、布局、渲染、交互和扩展能力之间是什么关系？',
    },
  ],
  en: [
    {
      id: 'business-entities',
      mode: 'create',
      template: 'business',
      title: 'Users, orders, and products',
      description: 'Detect business entities and actions, then build a left-to-right hierarchy.',
      prompt:
        'Draw a relationship graph for users, orders, and products: users create orders and orders contain multiple products.',
    },
    {
      id: 'organization-tree',
      mode: 'create',
      template: 'organization',
      title: 'Organization chart',
      description: 'Arrange departments and roles in a clear top-down hierarchy.',
      prompt:
        'Draw an organization chart with a company, engineering, product, operations, and the lead of each department.',
    },
    {
      id: 'service-topology',
      mode: 'create',
      template: 'services',
      title: 'Service dependency topology',
      description: 'Show calls between the gateway, business services, and infrastructure.',
      prompt:
        'Draw a microservice dependency topology with an API gateway, auth, orders, payments, inventory, a queue, and a database.',
    },
    {
      id: 'g6lite-migration',
      mode: 'qa',
      template: 'knowledge',
      title: 'G6Lite capability map',
      description:
        'Explain the boundaries between data, layout, rendering, interaction, and extensions.',
      prompt:
        'How do data, layouts, rendering, interactions, and extensions work together in G6Lite?',
    },
  ],
};

const graphText = {
  zh: {
    generic: {
      title: '通用实体关系图',
      summary: '使用通用实体展示一组方向明确的关系，等待进一步替换为真实业务语义。',
      nodes: ['核心实体', '关联实体 A', '关联实体 B', '扩展实体'],
      edgeLabels: ['关联', '关联', '扩展'],
    },
    business: {
      title: '业务实体关系图',
      summary: '用户创建订单，订单包含商品，并通过支付完成交易。',
      nodes: ['用户', '订单 A', '订单 B', '商品', '优惠券', '支付'],
      edgeLabels: ['创建', '创建', '包含', '使用', '支付'],
    },
    organization: {
      title: '组织架构图',
      summary: '公司由研发、产品和运营三个部门组成，各部门包含负责人或核心岗位。',
      nodes: [
        'G6Lite 团队',
        '研发部',
        '产品部',
        '运营部',
        '前端负责人',
        '图形研发',
        '产品经理',
        '社区运营',
      ],
      edgeLabels: ['包含', '包含', '包含', '负责', '负责', '负责', '负责'],
    },
    services: {
      title: '服务依赖拓扑',
      summary: 'API 网关连接核心业务服务，业务服务共同依赖消息队列和数据库。',
      nodes: ['API 网关', '认证服务', '订单服务', '支付服务', '库存服务', '消息队列', '数据库'],
      edgeLabels: ['鉴权', '路由', '路由', '路由', '发布事件', '写入', '扣减库存'],
    },
    knowledge: {
      title: 'G6Lite 能力关系网络',
      summary: 'Graph 统一编排数据、布局、渲染、交互和扩展能力。',
      nodes: ['Graph', '数据模型', '布局', 'WebGL 渲染', '交互', '状态', '扩展', '浏览器平台'],
      edgeLabels: ['管理', '调度', '驱动', '分发', '更新', '注册', '运行于'],
    },
  },
  en: {
    generic: {
      title: 'Generic entity graph',
      summary:
        'Generic entities show a small directed relationship set that can be refined with domain details.',
      nodes: ['Core entity', 'Related entity A', 'Related entity B', 'Extended entity'],
      edgeLabels: ['relates to', 'relates to', 'extends'],
    },
    business: {
      title: 'Business entity graph',
      summary: 'Users create orders, orders contain products, and payments complete transactions.',
      nodes: ['User', 'Order A', 'Order B', 'Product', 'Coupon', 'Payment'],
      edgeLabels: ['creates', 'creates', 'contains', 'uses', 'pays'],
    },
    organization: {
      title: 'Organization chart',
      summary: 'The team contains engineering, product, and operations with their core roles.',
      nodes: [
        'G6Lite team',
        'Engineering',
        'Product',
        'Operations',
        'Frontend lead',
        'Graphics engineer',
        'Product manager',
        'Community lead',
      ],
      edgeLabels: ['contains', 'contains', 'contains', 'owns', 'owns', 'owns', 'owns'],
    },
    services: {
      title: 'Service dependency topology',
      summary: 'The API gateway connects business services that share a queue and database.',
      nodes: ['API gateway', 'Auth', 'Orders', 'Payments', 'Inventory', 'Queue', 'Database'],
      edgeLabels: [
        'authenticates',
        'routes',
        'routes',
        'routes',
        'publishes',
        'writes',
        'reserves',
      ],
    },
    knowledge: {
      title: 'G6Lite capability network',
      summary: 'Graph orchestrates data, layouts, rendering, interactions, states, and extensions.',
      nodes: [
        'Graph',
        'Data model',
        'Layouts',
        'WebGL renderer',
        'Interactions',
        'States',
        'Extensions',
        'Browser',
      ],
      edgeLabels: [
        'manages',
        'schedules',
        'drives',
        'dispatches',
        'updates',
        'registers',
        'runs on',
      ],
    },
  },
} as const;

function genericGraph(locale: Locale): MockGraph {
  const copy = graphText[locale].generic;
  return {
    template: 'generic',
    title: copy.title,
    summary: copy.summary,
    layout: 'horizontal',
    theme: 'purple',
    showLabels: true,
    nodes: [
      { id: 'core', label: copy.nodes[0], group: 'primary', level: 0 },
      { id: 'related-a', label: copy.nodes[1], group: 'secondary', level: 1 },
      { id: 'related-b', label: copy.nodes[2], group: 'secondary', level: 1 },
      { id: 'extended', label: copy.nodes[3], group: 'accent', level: 2 },
    ],
    edges: [
      { id: 'core-related-a', source: 'core', target: 'related-a', label: copy.edgeLabels[0] },
      { id: 'core-related-b', source: 'core', target: 'related-b', label: copy.edgeLabels[1] },
      {
        id: 'related-a-extended',
        source: 'related-a',
        target: 'extended',
        label: copy.edgeLabels[2],
      },
    ],
  };
}

function businessGraph(locale: Locale): MockGraph {
  const copy = graphText[locale].business;
  return {
    template: 'business',
    title: copy.title,
    summary: copy.summary,
    layout: 'horizontal',
    theme: 'blue',
    showLabels: true,
    nodes: [
      { id: 'user', label: copy.nodes[0], group: 'primary', level: 0 },
      { id: 'order-a', label: copy.nodes[1], group: 'secondary', level: 1 },
      { id: 'order-b', label: copy.nodes[2], group: 'secondary', level: 1 },
      { id: 'product', label: copy.nodes[3], group: 'accent', level: 2 },
      { id: 'coupon', label: copy.nodes[4], group: 'neutral', level: 2 },
      { id: 'payment', label: copy.nodes[5], group: 'accent', level: 2 },
    ],
    edges: [
      { id: 'user-order-a', source: 'user', target: 'order-a', label: copy.edgeLabels[0] },
      { id: 'user-order-b', source: 'user', target: 'order-b', label: copy.edgeLabels[1] },
      { id: 'order-a-product', source: 'order-a', target: 'product', label: copy.edgeLabels[2] },
      { id: 'order-a-coupon', source: 'order-a', target: 'coupon', label: copy.edgeLabels[3] },
      { id: 'order-b-payment', source: 'order-b', target: 'payment', label: copy.edgeLabels[4] },
    ],
  };
}

function organizationGraph(locale: Locale): MockGraph {
  const copy = graphText[locale].organization;
  return {
    template: 'organization',
    title: copy.title,
    summary: copy.summary,
    layout: 'vertical',
    theme: 'purple',
    showLabels: true,
    nodes: [
      { id: 'team', label: copy.nodes[0], group: 'primary', level: 0 },
      { id: 'engineering', label: copy.nodes[1], group: 'secondary', level: 1 },
      { id: 'product', label: copy.nodes[2], group: 'secondary', level: 1 },
      { id: 'operations', label: copy.nodes[3], group: 'secondary', level: 1 },
      { id: 'frontend-lead', label: copy.nodes[4], group: 'accent', level: 2 },
      { id: 'graphics-engineer', label: copy.nodes[5], group: 'neutral', level: 2 },
      { id: 'product-manager', label: copy.nodes[6], group: 'accent', level: 2 },
      { id: 'community-lead', label: copy.nodes[7], group: 'neutral', level: 2 },
    ],
    edges: [
      { id: 'team-engineering', source: 'team', target: 'engineering', label: copy.edgeLabels[0] },
      { id: 'team-product', source: 'team', target: 'product', label: copy.edgeLabels[1] },
      { id: 'team-operations', source: 'team', target: 'operations', label: copy.edgeLabels[2] },
      {
        id: 'engineering-frontend',
        source: 'engineering',
        target: 'frontend-lead',
        label: copy.edgeLabels[3],
      },
      {
        id: 'engineering-graphics',
        source: 'engineering',
        target: 'graphics-engineer',
        label: copy.edgeLabels[4],
      },
      {
        id: 'product-product-manager',
        source: 'product',
        target: 'product-manager',
        label: copy.edgeLabels[5],
      },
      {
        id: 'operations-community',
        source: 'operations',
        target: 'community-lead',
        label: copy.edgeLabels[6],
      },
    ],
  };
}

function servicesGraph(locale: Locale): MockGraph {
  const copy = graphText[locale].services;
  return {
    template: 'services',
    title: copy.title,
    summary: copy.summary,
    layout: 'radial',
    theme: 'red',
    showLabels: true,
    nodes: [
      { id: 'gateway', label: copy.nodes[0], group: 'primary', level: 0 },
      { id: 'auth', label: copy.nodes[1], group: 'secondary', level: 1 },
      { id: 'orders', label: copy.nodes[2], group: 'secondary', level: 1 },
      { id: 'payments', label: copy.nodes[3], group: 'accent', level: 1 },
      { id: 'inventory', label: copy.nodes[4], group: 'secondary', level: 1 },
      { id: 'queue', label: copy.nodes[5], group: 'neutral', level: 2 },
      { id: 'database', label: copy.nodes[6], group: 'neutral', level: 2 },
    ],
    edges: [
      { id: 'gateway-auth', source: 'gateway', target: 'auth', label: copy.edgeLabels[0] },
      { id: 'gateway-orders', source: 'gateway', target: 'orders', label: copy.edgeLabels[1] },
      { id: 'gateway-payments', source: 'gateway', target: 'payments', label: copy.edgeLabels[2] },
      {
        id: 'gateway-inventory',
        source: 'gateway',
        target: 'inventory',
        label: copy.edgeLabels[3],
      },
      { id: 'orders-queue', source: 'orders', target: 'queue', label: copy.edgeLabels[4] },
      {
        id: 'payments-database',
        source: 'payments',
        target: 'database',
        label: copy.edgeLabels[5],
      },
      { id: 'orders-inventory', source: 'orders', target: 'inventory', label: copy.edgeLabels[6] },
    ],
  };
}

function knowledgeGraph(locale: Locale): MockGraph {
  const copy = graphText[locale].knowledge;
  return {
    template: 'knowledge',
    title: copy.title,
    summary: copy.summary,
    layout: 'radial',
    theme: 'green',
    showLabels: true,
    nodes: [
      { id: 'graph', label: copy.nodes[0], group: 'primary', level: 0 },
      { id: 'data', label: copy.nodes[1], group: 'secondary', level: 1 },
      { id: 'layout', label: copy.nodes[2], group: 'secondary', level: 1 },
      { id: 'renderer', label: copy.nodes[3], group: 'accent', level: 1 },
      { id: 'interaction', label: copy.nodes[4], group: 'secondary', level: 1 },
      { id: 'state', label: copy.nodes[5], group: 'neutral', level: 1 },
      { id: 'extension', label: copy.nodes[6], group: 'accent', level: 1 },
      { id: 'browser', label: copy.nodes[7], group: 'neutral', level: 2 },
    ],
    edges: [
      { id: 'graph-data', source: 'graph', target: 'data', label: copy.edgeLabels[0] },
      { id: 'graph-layout', source: 'graph', target: 'layout', label: copy.edgeLabels[1] },
      { id: 'graph-renderer', source: 'graph', target: 'renderer', label: copy.edgeLabels[2] },
      {
        id: 'graph-interaction',
        source: 'graph',
        target: 'interaction',
        label: copy.edgeLabels[3],
      },
      { id: 'graph-state', source: 'graph', target: 'state', label: copy.edgeLabels[4] },
      { id: 'graph-extension', source: 'graph', target: 'extension', label: copy.edgeLabels[5] },
      { id: 'renderer-browser', source: 'renderer', target: 'browser', label: copy.edgeLabels[6] },
    ],
  };
}

export function getMockCases(locale: Locale): MockCase[] {
  return cases[locale];
}

export function createMockGraphFromTemplate(
  template: MockGraphTemplate,
  locale: Locale,
): MockGraph {
  switch (template) {
    case 'business':
      return businessGraph(locale);
    case 'generic':
      return genericGraph(locale);
    case 'organization':
      return organizationGraph(locale);
    case 'services':
      return servicesGraph(locale);
    case 'knowledge':
      return knowledgeGraph(locale);
  }
}

function detectTemplate(prompt: string): MockGraphTemplate {
  const normalized = prompt.toLowerCase();
  if (/(组织|部门|员工|岗位|架构|organization|department|employee|role)/i.test(normalized)) {
    return 'organization';
  }
  if (/(服务|依赖|调用|拓扑|网关|service|dependency|topology|gateway)/i.test(normalized)) {
    return 'services';
  }
  if (/(知识|概念|能力|数据.*布局|knowledge|concept|capabilit|layout.*render)/i.test(normalized)) {
    return 'knowledge';
  }
  if (/(用户|订单|商品|客户|user|order|product|customer)/i.test(normalized)) {
    return 'business';
  }
  return 'generic';
}

export function needsMockPromptClarification(
  prompt: string,
  locale: Locale,
  mode: AiWorkspaceMode,
): boolean {
  if (mode === 'qa') return false;

  const normalized = prompt
    .trim()
    .toLowerCase()
    .replace(/[，。！？,.!?]/g, '')
    .replace(/\s+/g, ' ');
  if (!normalized) return true;

  const vaguePatterns =
    locale === 'zh'
      ? [
          /^生成(一个|一张)?关系图$/,
          /^画(一个|一张)?关系图$/,
          /^帮我(生成|画)(一个|一张)?(关系)?图$/,
          /^生成(一个|一张)?图$/,
        ]
      : [
          /^(generate|create|draw) (a )?(relationship )?graph$/,
          /^(generate|create|draw) (a )?graph for me$/,
        ];

  if (vaguePatterns.some((pattern) => pattern.test(normalized))) return true;

  const hasEntitySignal =
    /(用户|订单|商品|客户|组织|部门|员工|岗位|服务|网关|数据库|知识|概念|user|order|product|customer|organization|department|employee|service|gateway|database|knowledge|concept)/i.test(
      normalized,
    );
  const hasRelationSignal =
    /(关系|关联|创建|包含|依赖|调用|属于|连接|之间|relationship|relate|create|contain|depend|call|belong|connect|between)/i.test(
      normalized,
    );

  return normalized.length < (locale === 'zh' ? 10 : 18) && !hasEntitySignal && !hasRelationSignal;
}

export function generateMockResult(
  prompt: string,
  locale: Locale,
  mode: AiWorkspaceMode,
): MockGenerationResult {
  const graph = createMockGraphFromTemplate(detectTemplate(prompt), locale);
  const reply =
    locale === 'zh'
      ? mode === 'qa'
        ? `这是一个站内 Mock 回答。我把问题整理为「${graph.title}」，右侧关系图展示了主要模块与依赖，数据和代码面板给出同一份结构化结果。`
        : `已从描述中识别 ${graph.nodes.length} 个节点和 ${graph.edges.length} 条关系，并生成「${graph.title}」。你可以继续要求调整方向、颜色、标签或增加节点。`
      : mode === 'qa'
        ? `This is an in-site mock answer. I mapped the question to “${graph.title}”; the graph, data, and code panels share the same structured result.`
        : `I detected ${graph.nodes.length} nodes and ${graph.edges.length} relationships and generated “${graph.title}”. You can ask to change direction, color, labels, or add a node.`;
  return { graph, reply };
}

export function adjustMockGraph(
  currentGraph: MockGraph,
  prompt: string,
  locale: Locale,
): MockGenerationResult {
  const normalized = prompt.toLowerCase();
  const graph: MockGraph = {
    ...currentGraph,
    nodes: currentGraph.nodes.map((node) => ({ ...node })),
    edges: currentGraph.edges.map((edge) => ({ ...edge })),
  };
  const changes: string[] = [];

  if (/(从左到右|横向|horizontal|left to right)/i.test(normalized)) {
    graph.layout = 'horizontal';
    changes.push(locale === 'zh' ? '切换为从左到右布局' : 'switched to a left-to-right layout');
  }
  if (/(从上到下|纵向|vertical|top to bottom)/i.test(normalized)) {
    graph.layout = 'vertical';
    changes.push(locale === 'zh' ? '切换为从上到下布局' : 'switched to a top-to-bottom layout');
  }
  if (/(环形|中心辐射|radial|circular)/i.test(normalized)) {
    graph.layout = 'radial';
    changes.push(locale === 'zh' ? '切换为中心辐射布局' : 'switched to a radial layout');
  }

  const themeMatches: Array<[RegExp, MockGraphTheme, string, string]> = [
    [/(蓝色|blue)/i, 'blue', '蓝色', 'blue'],
    [/(紫色|purple|violet)/i, 'purple', '紫色', 'purple'],
    [/(绿色|green)/i, 'green', '绿色', 'green'],
    [/(红色|red)/i, 'red', '红色', 'red'],
  ];
  for (const [pattern, theme, zhName, enName] of themeMatches) {
    if (!pattern.test(normalized)) continue;
    graph.theme = theme;
    changes.push(locale === 'zh' ? `主题改为${zhName}` : `changed the theme to ${enName}`);
    break;
  }

  if (/(隐藏标签|不显示标签|hide labels?)/i.test(normalized)) {
    graph.showLabels = false;
    changes.push(locale === 'zh' ? '隐藏标签' : 'hid labels');
  } else if (/(显示标签|show labels?)/i.test(normalized)) {
    graph.showLabels = true;
    changes.push(locale === 'zh' ? '显示标签' : 'showed labels');
  }

  if (/(增加.*节点|添加.*节点|add (a |one )?node)/i.test(normalized)) {
    const index = graph.nodes.filter((node) => node.id.startsWith('added-')).length + 1;
    const id = `added-${index}`;
    const source = graph.nodes[Math.max(0, graph.nodes.length - 1)]?.id ?? graph.nodes[0].id;
    graph.nodes.push({
      id,
      label: locale === 'zh' ? `新增节点 ${index}` : `New node ${index}`,
      group: 'accent',
      level: Math.max(...graph.nodes.map((node) => node.level)) + 1,
    });
    graph.edges.push({
      id: `${source}-${id}`,
      source,
      target: id,
      label: locale === 'zh' ? '新增关系' : 'new relation',
    });
    changes.push(locale === 'zh' ? '增加一个节点和连接关系' : 'added a node and relation');
  }

  const reply =
    changes.length > 0
      ? locale === 'zh'
        ? `已${changes.join('，')}。图数据与 G6Lite 代码已同步更新。`
        : `I ${changes.join(', ')}. The graph data and G6Lite code are updated too.`
      : locale === 'zh'
        ? '当前是交互原型，我暂时能识别布局方向、蓝/紫/绿/红主题、标签显示以及增加节点等调整。'
        : 'This prototype currently understands layout direction, blue/purple/green/red themes, label visibility, and adding a node.';

  return { graph, reply };
}

export function serializeMockGraph(graph: MockGraph): string {
  return JSON.stringify(toG6LiteGraphData(graph), null, 2);
}

export function toG6LiteGraphData(graph: MockGraph): G6LiteGraphData {
  return {
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      data: { label: node.label, group: node.group, level: node.level },
    })),
    edges: graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: { label: edge.label },
    })),
  };
}

export function getG6LiteLayoutConfig(graph: MockGraph): G6LiteLayoutConfig {
  if (graph.layout === 'radial') {
    return { type: 'circular', radius: Math.max(150, graph.nodes.length * 24) };
  }

  return {
    type: 'dagre',
    rankdir: graph.layout === 'horizontal' ? 'LR' : 'TB',
    nodesep: 42,
    ranksep: 86,
    nodeSize: [132, 48],
  };
}

export function buildMockCode(graph: MockGraph): string {
  const data = serializeMockGraph(graph);
  const palette = mockThemeColors[graph.theme];
  const layout = JSON.stringify(getG6LiteLayoutConfig(graph));
  const labelStyle = graph.showLabels
    ? `\n      label: (node) => String(node.data?.label ?? node.id),\n      labelPlacement: 'center',\n      labelColor: (node) => node.data?.group === 'neutral' ? '#334155' : '#ffffff',`
    : `\n      label: () => false,`;

  return `import { Graph } from '@antv/g6-lite';

const data = ${data};

const graph = new Graph({
  container: 'graph',
  data,
  layout: ${layout},
  label: { scaleWithZoom: false, hideOnLowZoom: false, hideOnCollision: true },
  node: {
    type: 'rect',
    style: {
      width: 132,
      height: 48,
      borderRadius: 24,
      fill: (node) => ({
        primary: '${palette.primary}',
        secondary: '${palette.secondary}',
        accent: '${palette.accent}',
        neutral: '${palette.neutral}',
      })[node.data?.group] ?? '${palette.primary}',
      stroke: '#ffffff',
      strokeWidth: 1.5,${labelStyle}
    },
  },
  edge: {
    style: {
      stroke: '${palette.edge}',
      lineWidth: 1.5,
      endArrow: true,
      ${
        graph.showLabels
          ? `label: (_source, _target, edge) => String(edge.data?.label ?? ''),
      labelBackground: 'rgba(255, 255, 255, 0.88)',
      labelBackgroundPadding: 2.5,
      labelAutoRotate: ${graph.layout !== 'radial'},`
          : `label: () => false,`
      }
    },
  },
  behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'highlight-node', 'highlight-edge'],
});

await graph.render();
graph.fitView({ padding: 72, maxZoom: 1.2 });`;
}
