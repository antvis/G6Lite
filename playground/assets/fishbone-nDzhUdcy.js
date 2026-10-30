const e=`/**
 * Demo: 鱼骨图 (Fishbone/Ishikawa Diagram) — 盈利未达预期分析
 */
import { Graph, type GraphEdge, type GraphNode } from '../../src/index.ts';
import { attachLabelsCanvas, type GraphInstanceWithTools } from '../tooling.ts';

const CATEGORY_COLORS = ['#E8684A', '#5B8FF9', '#5AD8A6', '#F6BD16', '#6F5EF9', '#5D7092'];

const NODE_LEVELS = {
  HEAD: 'head',
  CATEGORY: 'category',
  ITEM: 'item',
};

function createFishboneData() {
  const nodes = [
    { id: 'head', name: '盈利未达预期', data: { level: NODE_LEVELS.HEAD } },
    { id: 'cat0', name: '人员', data: { level: NODE_LEVELS.CATEGORY, categoryIndex: 0 } },
    { id: 'cat1', name: '设备', data: { level: NODE_LEVELS.CATEGORY, categoryIndex: 1 } },
    { id: 'cat2', name: '方法', data: { level: NODE_LEVELS.CATEGORY, categoryIndex: 2 } },
    { id: 'cat3', name: '材料', data: { level: NODE_LEVELS.CATEGORY, categoryIndex: 3 } },
    { id: 'cat4', name: '环境', data: { level: NODE_LEVELS.CATEGORY, categoryIndex: 4 } },
    { id: 'cat5', name: '测量', data: { level: NODE_LEVELS.CATEGORY, categoryIndex: 5 } },
    { id: 'cat0-item0', name: '培训不足', data: { level: NODE_LEVELS.ITEM, categoryIndex: 0 } },
    { id: 'cat0-item1', name: '经验欠缺', data: { level: NODE_LEVELS.ITEM, categoryIndex: 0 } },
    { id: 'cat0-item2', name: '人员流动', data: { level: NODE_LEVELS.ITEM, categoryIndex: 0 } },
    { id: 'cat1-item0', name: '设备老化', data: { level: NODE_LEVELS.ITEM, categoryIndex: 1 } },
    { id: 'cat1-item1', name: '维护不当', data: { level: NODE_LEVELS.ITEM, categoryIndex: 1 } },
    { id: 'cat2-item0', name: '流程不合理', data: { level: NODE_LEVELS.ITEM, categoryIndex: 2 } },
    { id: 'cat2-item1', name: '标准缺失', data: { level: NODE_LEVELS.ITEM, categoryIndex: 2 } },
    { id: 'cat2-item2', name: '执行不到位', data: { level: NODE_LEVELS.ITEM, categoryIndex: 2 } },
    { id: 'cat3-item0', name: '供应商问题', data: { level: NODE_LEVELS.ITEM, categoryIndex: 3 } },
    { id: 'cat3-item1', name: '质检不严', data: { level: NODE_LEVELS.ITEM, categoryIndex: 3 } },
    { id: 'cat4-item0', name: '市场竞争', data: { level: NODE_LEVELS.ITEM, categoryIndex: 4 } },
    { id: 'cat4-item1', name: '政策变化', data: { level: NODE_LEVELS.ITEM, categoryIndex: 4 } },
    { id: 'cat5-item0', name: '数据不准', data: { level: NODE_LEVELS.ITEM, categoryIndex: 5 } },
  ];

  const edges = [
    { source: 'head', target: 'cat0' },
    { source: 'head', target: 'cat1' },
    { source: 'head', target: 'cat2' },
    { source: 'head', target: 'cat3' },
    { source: 'head', target: 'cat4' },
    { source: 'head', target: 'cat5' },
    { source: 'cat0', target: 'cat0-item0' },
    { source: 'cat0', target: 'cat0-item1' },
    { source: 'cat0', target: 'cat0-item2' },
    { source: 'cat1', target: 'cat1-item0' },
    { source: 'cat1', target: 'cat1-item1' },
    { source: 'cat2', target: 'cat2-item0' },
    { source: 'cat2', target: 'cat2-item1' },
    { source: 'cat2', target: 'cat2-item2' },
    { source: 'cat3', target: 'cat3-item0' },
    { source: 'cat3', target: 'cat3-item1' },
    { source: 'cat4', target: 'cat4-item0' },
    { source: 'cat4', target: 'cat4-item1' },
    { source: 'cat5', target: 'cat5-item0' },
  ];

  return { nodes, edges };
}

const data = createFishboneData();

function getNodeSize(node: { name?: string; data?: Record<string, unknown> }) {
  const level = node.data?.level as string;
  const name = node.name || '';
  const charWidth = 14;
  const padding = 24;
  const minWidth = 60;
  const calculatedWidth = Math.max(minWidth, name.length * charWidth + padding);

  if (level === NODE_LEVELS.HEAD) {
    return { width: 160, height: 50 };
  } else if (level === NODE_LEVELS.CATEGORY) {
    return { width: 100, height: 36 };
  }
  return { width: calculatedWidth, height: 28 };
}

function getNodeStyle(node: { data?: Record<string, unknown> }) {
  const level = node.data?.level as string;
  const categoryIndex = node.data?.categoryIndex as number | undefined;
  const categoryColor = categoryIndex !== undefined ? CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length] : '#5B8FF9';
  const size = getNodeSize(node);

  if (level === NODE_LEVELS.HEAD) {
    return { fill: '#E8684A', width: size.width, height: size.height, borderRadius: 8, stroke: 'transparent', strokeWidth: 0 };
  } else if (level === NODE_LEVELS.CATEGORY) {
    return { fill: categoryColor, width: size.width, height: size.height, borderRadius: 6, stroke: 'transparent', strokeWidth: 0 };
  }
  return { fill: 'transparent', width: size.width, height: size.height, borderRadius: 0, stroke: 'transparent', strokeWidth: 0 };
}

function getNodeLabelColor(node: { data?: Record<string, unknown> }) {
  const level = node.data?.level as string;
  return level === NODE_LEVELS.ITEM ? '#333' : '#fff';
}

function getEdgeColor(_source: GraphNode, _target: GraphNode, edge: GraphEdge) {
  const targetNode = data.nodes.find(n => n.id === edge.target);
  const categoryIndex = targetNode?.data?.categoryIndex as number | undefined;
  return categoryIndex !== undefined ? CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length] : '#d9d9d9';
}

export async function run(container: string | HTMLElement) {
  const wrapper = typeof container === 'string' ? document.querySelector(container)! as HTMLElement : container;
  wrapper.style.position = 'relative';

  const graph = new Graph({
    autoFit: true,
    container: wrapper,
    data,
    node: { type: 'rect', style: (n) => getNodeStyle(n) },
    edge: { type: 'polyline', style: { stroke: getEdgeColor, lineWidth: 1.5, router: 'fishbone', endArrow: false, startArrow: false } },
    layout: { type: 'fishbone', direction: 'LR', categoryGap: 180, itemGap: 44, itemHStep: 50, categoryDistance: 200 },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    theme: 'light',
  });

  await graph.render();
  graph.fitView({ padding: 64, maxZoom: 1 });

  const g = graph as unknown as GraphInstanceWithTools;
  const cleanupLabels = attachLabelsCanvas(wrapper, g, {
    nodeLabel: (n) => n.name ?? n.id,
    position: (n) => (n.data?.level as string) === NODE_LEVELS.ITEM ? 'right-edge' : 'inside',
    nodeSize: (n) => {
      const size = getNodeSize(n);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      return { width: size.width / dpr, height: size.height / dpr };
    },
    fontSize: (n) => {
      const level = n.data?.level as string;
      const size = level === NODE_LEVELS.HEAD ? 16 : level === NODE_LEVELS.CATEGORY ? 14 : 12;
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
`;export{e as default};
