import type { GraphNode, GraphOptions } from '../../../../src/index.ts';
import type { Locale } from '@/lib/i18n';

export const showcaseIds = ['relationship', 'org-chart', 'mindmap', 'fishbone'] as const;
export type ShowcaseId = (typeof showcaseIds)[number];
type Options = Omit<GraphOptions, 'container'>;

/** Shared branch colors keep related nodes and their incoming edges together. */
function colorizeExample(options: Options, groups: number[], dark: boolean): Options {
  const tones = dark
    ? [
        { fill: '#243954', stroke: '#79a4df', labelColor: '#c0d9ff' },
        { fill: '#203d35', stroke: '#6bb9a0', labelColor: '#b6e6d5' },
        { fill: '#463820', stroke: '#d4ad66', labelColor: '#f3d69c' },
        { fill: '#462c3d', stroke: '#d690b2', labelColor: '#f4c3da' },
      ]
    : [
        { fill: '#e7efff', stroke: '#7e9fd5', labelColor: '#315f9c' },
        { fill: '#e1f4eb', stroke: '#6db49d', labelColor: '#246d58' },
        { fill: '#fff0d8', stroke: '#d6ab60', labelColor: '#87601f' },
        { fill: '#fbe6ef', stroke: '#d38ba8', labelColor: '#98496b' },
      ];
  const circle = options.node?.type === 'circle';
  options.data.nodes.forEach((node, index) => {
    const tone = tones[groups[index] ?? 0];
    const colors =
      index === 0
        ? {
            fill: dark ? '#aabaf4' : '#596bc0',
            stroke: circle ? (dark ? '#354873' : '#e2e8ff') : dark ? '#c0ceff' : '#4d5eaf',
            labelColor: circle ? (dark ? '#dce5ff' : '#43558b') : dark ? '#182340' : '#ffffff',
          }
        : {
            ...tone,
            fill: circle ? tone.stroke : tone.fill,
            stroke: circle ? tone.fill : tone.stroke,
          };
    node.data = { ...node.data, ...colors };
  });
  const nodeStyle = typeof options.node?.style === 'function' ? {} : options.node?.style;
  options.node = {
    ...options.node,
    style: {
      ...nodeStyle,
      fill: (node) => String(node.data?.fill ?? '#7087cf'),
      stroke: (node) => String(node.data?.stroke ?? '#c7d1f0'),
      labelColor: (node) => String(node.data?.labelColor ?? '#3d508e'),
    },
  };
  options.edge = {
    ...options.edge,
    style: {
      ...options.edge?.style,
      stroke: circle
        ? (_source, target) => String(target.data?.fill ?? '#9baed4')
        : (_source, target) => String(target.data?.stroke ?? '#9baed4'),
    },
  };
  return options;
}

/** Small, deterministic examples shared by the live canvas and displayed source. */
export function showcaseOptions(id: ShowcaseId, locale: Locale, dark = false): Options {
  const zh = locale === 'zh';
  const options: Options = {
    data: { nodes: [], edges: [] },
    theme: { type: dark ? 'dark' : 'light', canvasBackground: dark ? '#10151c' : '#ffffff' },
    autoFit: { padding: 24 },
    label: { scaleWithZoom: false },
    node: {
      type: 'rect',
      style: {
        width: 100,
        height: 36,
        borderRadius: 8,
        fill: dark ? '#293655' : '#e6ebfe',
        stroke: dark ? '#526998' : '#c7d1f0',
        strokeWidth: 1,
        label: (node: GraphNode) => node.id,
        labelPlacement: 'center',
        labelFontSize: 13,
        labelColor: dark ? '#e0e7ff' : '#3d508e',
      },
    },
    edge: {
      type: 'polyline',
      style: {
        stroke: dark ? '#7083ad' : '#9baed4',
        lineWidth: 1.5,
        router: 'tree',
        endArrow: false,
      },
    },
    behaviors: ['drag-canvas', 'drag-node', 'hover-highlight'],
  };
  if (id === 'relationship') {
    const labels = zh
      ? ['G6Lite', 'React', 'Vue', 'TypeScript', 'WebGL', '布局', '数据', '交互']
      : ['G6Lite', 'React', 'Vue', 'TypeScript', 'WebGL', 'Layouts', 'Data', 'Interaction'];
    const positions = [
      [280, 200],
      [135, 80],
      [280, 45],
      [425, 80],
      [465, 235],
      [365, 350],
      [195, 350],
      [95, 235],
    ];
    options.data = {
      nodes: labels.map((label, index) => ({
        id: label,
        x: positions[index][0],
        y: positions[index][1],
      })),
      edges: labels.slice(1).map((target) => ({ source: labels[0], target })),
    };
    options.node = {
      type: 'circle',
      style: {
        size: 28,
        fill: dark ? '#a7b8ef' : '#7087cf',
        stroke: dark ? '#293655' : '#e6ebfe',
        strokeWidth: 6,
        label: (node: GraphNode) => node.id,
        labelPlacement: 'bottom',
        labelFontSize: 13,
        labelColor: dark ? '#e0e7ff' : '#3d508e',
      },
    };
    options.edge = {
      type: 'line',
      style: { stroke: dark ? '#52658c' : '#b9c6e4', lineWidth: 1.5 },
    };
    return colorizeExample(options, [0, 0, 1, 0, 2, 3, 1, 3], dark);
  }
  let labels: string[];
  let links: [number, number][];
  if (id === 'org-chart') {
    labels = zh
      ? ['产品团队', '设计', '研发', '运营', '体验设计', '前端开发', '后端开发']
      : ['Product', 'Design', 'Engineering', 'Operations', 'UX design', 'Frontend', 'Backend'];
    links = [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 4],
      [2, 5],
      [2, 6],
    ];
    options.layout = {
      type: 'dagre',
      rankdir: 'TB',
      nodesep: 32,
      ranksep: 70,
      nodeSize: [100, 36],
    };
  } else if (id === 'mindmap') {
    labels = zh
      ? ['项目规划', '目标', '设计', '开发', '交付', '用户需求', '交互方案', '功能验证', '发布上线']
      : [
          'Project',
          'Goals',
          'Design',
          'Build',
          'Delivery',
          'User needs',
          'Interaction',
          'Validation',
          'Release',
        ];
    links = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
      [4, 8],
    ];
    options.layout = {
      type: 'mindmap',
      direction: 'H',
      levelGap: 40,
      nodeGap: 120,
      getSide: (node: GraphNode) => (node.data?.side === 'left' ? 'left' : 'right'),
    };
    options.edge = {
      type: 'cubic',
      style: { stroke: dark ? '#7083ad' : '#9baed4', lineWidth: 1.5, curveOffset: 40 },
    };
  } else {
    labels = zh
      ? ['交付延期', '人员', '流程', '技术', '资源', '沟通不足', '需求变更', '接口依赖', '排期冲突']
      : ['Delay', 'People', 'Process', 'Tech', 'Resources', 'Handoffs', 'Scope', 'API', 'Schedule'];
    links = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
      [4, 8],
    ];
    options.layout = {
      type: 'fishbone',
      direction: 'LR',
      categoryGap: 110,
      categoryDistance: 100,
      itemHStep: 30,
    };
    options.node = {
      type: 'rect',
      style: {
        width: 80,
        height: 30,
        borderRadius: 6,
        fill: dark ? '#293655' : '#e6ebfe',
        label: (node: GraphNode) => node.id,
        labelPlacement: 'center',
        labelFontSize: 12,
        labelColor: dark ? '#e0e7ff' : '#3d508e',
      },
    };
    options.edge = {
      type: 'polyline',
      style: { stroke: dark ? '#7083ad' : '#9baed4', lineWidth: 1.5, router: 'fishbone' },
    };
  }
  options.data = {
    nodes: labels.map((label) => ({ id: label })),
    edges: links.map(([source, target]) => ({ source: labels[source], target: labels[target] })),
  };
  if (id === 'mindmap') {
    const leftBranches = new Set([1, 2, 5, 6]);
    options.data.nodes.forEach((node, index) => {
      if (index > 0) node.data = { side: leftBranches.has(index) ? 'left' : 'right' };
    });
  }
  const groups =
    id === 'org-chart'
      ? [0, 3, 0, 1, 3, 0, 0]
      : id === 'mindmap'
        ? [0, 0, 3, 1, 2, 0, 3, 1, 2]
        : [0, 0, 1, 2, 3, 0, 1, 2, 3];
  return colorizeExample(options, groups, dark);
}

export function showcaseSource(id: ShowcaseId, locale: Locale, dark = false): string {
  const { data, ...options } = showcaseOptions(id, locale, dark);
  // These callbacks are self-contained; preserve them in the copied source.
  const callbacks: string[] = [];
  const config = JSON.stringify(
    options,
    (key, value) => {
      if (typeof value !== 'function') return value;
      const token = `__showcase_callback_${callbacks.length}__`;
      let source = value.toString();
      // LayoutConfig accepts arbitrary options, so getSide needs an explicit
      // parameter type in the copied TypeScript rather than contextual typing.
      if (key === 'getSide') {
        source = source.replace(
          /^\(?([\w$]+)\)?\s*=>/,
          '($1: { data?: Record<string, unknown> }) =>',
        );
      }
      callbacks.push(source);
      return token;
    },
    2,
  )
    .replace(/"__showcase_callback_(\d+)__"/g, (_match, index) => callbacks[Number(index)])
    .slice(2, -2);
  const nodes = data.nodes.map((node) => `    ${JSON.stringify(node)}`).join(',\n');
  const edges = data.edges.map((edge) => `    ${JSON.stringify(edge)}`).join(',\n');
  return `import { Graph } from '@antv/g6-lite';

// HTML: <div id="container" style="height: 360px"></div>
const data = {
  nodes: [
${nodes}
  ],
  edges: [
${edges}
  ],
};

const graph = new Graph({
  container: '#container',
  data,
${config}
});

await graph.render();

// ${locale === 'zh' ? '组件卸载时调用 graph.destroy()。' : 'Call graph.destroy() when the component unmounts.'}`;
}
