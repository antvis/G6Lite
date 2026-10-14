const n=`/**
 * Demo: 思维导图 (Mind Map) — 台风形成因素
 */
import { Graph, type GraphEdge, type GraphNode } from '../../src/index.ts';
import { attachLabelsCanvas, type GraphInstanceWithTools } from '../tooling.ts';

const BRANCH_COLORS = ['#E8684A', '#5B8FF9', '#5AD8A6', '#F6BD16'];

// 节点层级定义
const NODE_LEVELS = {
  ROOT: 'root',
  LEVEL1: 'level1',
  CHILD: 'child',
};

const data = {
  nodes: [
    { id: 'root', name: '台风形成的因素', data: { level: NODE_LEVELS.ROOT } },
    // 左侧 - 地理环境
    { id: 'left1', name: '地理环境', data: { level: NODE_LEVELS.LEVEL1, branch: 0 } },
    { id: 'left1-1', name: '海温', data: { level: NODE_LEVELS.CHILD, branch: 0 } },
    { id: 'left1-2', name: '海洋面积', data: { level: NODE_LEVELS.CHILD, branch: 0 } },
    { id: 'left1-3', name: '赤道气流影响', data: { level: NODE_LEVELS.CHILD, branch: 0 } },
    { id: 'left1-4', name: '海水蒸发量', data: { level: NODE_LEVELS.CHILD, branch: 0 } },
    { id: 'left1-5', name: '热带海域海表温度分布特征', data: { level: NODE_LEVELS.CHILD, branch: 0 } },
    // 右侧 - 气象条件
    { id: 'right1', name: '气象条件', data: { level: NODE_LEVELS.LEVEL1, branch: 1 } },
    { id: 'right1-1', name: '气压', data: { level: NODE_LEVELS.CHILD, branch: 1 } },
    { id: 'right1-2', name: '风速切变', data: { level: NODE_LEVELS.CHILD, branch: 1 } },
    { id: 'right1-3', name: '湿度条件', data: { level: NODE_LEVELS.CHILD, branch: 1 } },
    { id: 'right1-4', name: '大气环流模式', data: { level: NODE_LEVELS.CHILD, branch: 1 } },
  ],
  edges: [
    { source: 'root', target: 'left1' },
    { source: 'left1', target: 'left1-1' },
    { source: 'left1', target: 'left1-2' },
    { source: 'left1', target: 'left1-3' },
    { source: 'left1', target: 'left1-4' },
    { source: 'left1', target: 'left1-5' },
    { source: 'root', target: 'right1' },
    { source: 'right1', target: 'right1-1' },
    { source: 'right1', target: 'right1-2' },
    { source: 'right1', target: 'right1-3' },
    { source: 'right1', target: 'right1-4' },
  ],
};

// 获取节点尺寸 - 根据文字长度动态计算
function getNodeSize(node: { name?: string; data?: Record<string, unknown> }) {
  const level = node.data?.level as string;
  const name = node.name || '';
  const charWidth = 14; // 每个字符的宽度
  const padding = 20; // 左右内边距
  const minWidth = 60;
  const calculatedWidth = Math.max(minWidth, name.length * charWidth + padding);

  if (level === NODE_LEVELS.ROOT) {
    return { width: 140, height: 44 };
  } else if (level === NODE_LEVELS.LEVEL1) {
    return { width: Math.max(100, name.length * charWidth + padding), height: 36 };
  }
  return { width: calculatedWidth, height: 30 };
}

// 获取节点样式 - 匹配设计稿
function getNodeStyle(node: { data?: Record<string, unknown> }) {
  const level = node.data?.level as string;
  const branch = node.data?.branch as number | undefined;
  const branchColor = branch !== undefined ? BRANCH_COLORS[branch % BRANCH_COLORS.length] : '#5B8FF9';
  const size = getNodeSize(node);

  if (level === NODE_LEVELS.ROOT) {
    // 根节点：深蓝填充，白色文字，无边框
    return {
      fill: '#294172',
      width: size.width,
      height: size.height,
      borderRadius: 12,
      stroke: 'transparent',
      strokeWidth: 0,
    };
  } else if (level === NODE_LEVELS.LEVEL1) {
    // 一级节点：分支色填充，白色文字
    return {
      fill: branchColor,
      width: size.width,
      height: size.height,
      borderRadius: 10,
      stroke: 'transparent',
      strokeWidth: 0,
    };
  } else {
    // 子节点：白色填充，灰色边框，黑色文字
    return {
      fill: '#fff',
      width: size.width,
      height: size.height,
      borderRadius: 8,
      stroke: '#d9d9d9',
      strokeWidth: 1,
    };
  }
}

// 获取节点文字颜色
function getNodeLabelColor(node: { data?: Record<string, unknown> }) {
  const level = node.data?.level as string;
  // 根节点和一级节点用白色文字，子节点用黑色文字
  return level === NODE_LEVELS.CHILD ? '#333' : '#fff';
}

// 获取边颜色
function getEdgeColor(_source: GraphNode, _target: GraphNode, edge: GraphEdge) {
  const sourceNode = data.nodes.find(n => n.id === edge.source);
  const branch = sourceNode?.data?.branch as number | undefined;
  return branch !== undefined ? BRANCH_COLORS[branch % BRANCH_COLORS.length] : '#5B8FF9';
}

export async function run(container: string | HTMLElement) {
  const wrapper = typeof container === 'string' ? document.querySelector(container)! as HTMLElement : container;
  wrapper.style.position = 'relative';

  const graph = new Graph({
    autoFitOnResize: true,
    container: wrapper,
    data,
    node: {
      type: 'rect',
      style: (n) => getNodeStyle(n),
    },
    edge: {
      type: 'cubic',
      style: {
        stroke: getEdgeColor,
        lineWidth: 1,
        curveOffset: 60,
      },
    },
    layout: {
      type: 'mindmap',
      direction: 'H',
      levelGap: 120,  // 缩短左右间距
      nodeGap: 12,
      branchColors: BRANCH_COLORS,
      getWidth: (n: GraphNode) => getNodeSize(n).width,
      getHeight: (n: GraphNode) => getNodeSize(n).height,
      getSide: (n: GraphNode, index: number) => {
        // 一级子节点交替分配到左右
        const branch = n.data?.branch as number | undefined;
        if (branch !== undefined) {
          return branch % 2 === 0 ? 'left' : 'right';
        }
        return index % 2 === 0 ? 'left' : 'right';
      },
    },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    theme: 'light',
  });

  await graph.render();
  graph.fitView({ padding: 64, maxZoom: 1 });

  const g = graph as unknown as GraphInstanceWithTools;
  const cleanupLabels = attachLabelsCanvas(wrapper, g, {
    nodeLabel: (n) => n.name ?? n.id,
    position: 'inside',
    nodeSize: (n) => {
      const size = getNodeSize(n);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      return { width: size.width / dpr, height: size.height / dpr };
    },
    fontSize: (n) => {
      const level = n.data?.level as string;
      const size = level === NODE_LEVELS.ROOT ? 20 : level === NODE_LEVELS.LEVEL1 ? 16 : 14;
      // Camera zoom is measured in physical pixels; the overlay expects CSS pixels.
      return size * graph.getCamera().zoom / Math.min(2, window.devicePixelRatio || 1);
    },
    color: (n) => getNodeLabelColor(n),
  });

  return {
    fitView: () => graph.fitView({ padding: 64, maxZoom: 1.5 }),
    destroy: () => { cleanupLabels(); graph.destroy(); },
  };
}
`;export{n as default};
