/**
 * 截图页:用真实 g6-lite 渲染单个布局,供 scripts/capture-thumbnails 截图。
 * 布局与配色由 URL hash 决定,如 #force|5B8FF9
 */

// 截图必须保留绘制缓冲,否则跨次导航 playwright 截到的是上一帧/空白帧。
// ES import 会被提升,所以在补丁后用动态 import 引入 Graph。
const _getContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, attrs?: WebGLContextAttributes) {
  if (kind === 'webgl' || kind === 'webgl2' || kind === 'experimental-webgl') {
    return _getContext.call(this, kind, { ...attrs, preserveDrawingBuffer: true });
  }
  return _getContext.call(this, kind, attrs);
} as typeof HTMLCanvasElement.prototype.getContext;

type Cfg = { layout: Record<string, unknown>; data: { nodes: { id: string }[]; edges: { source: string; target: string }[] } };

// 小型网络(circular / grid)
const net = {
  nodes: Array.from({ length: 12 }, (_, i) => ({ id: String(i) })),
  edges: [
    { source: '0', target: '1' }, { source: '0', target: '2' }, { source: '0', target: '3' },
    { source: '1', target: '4' }, { source: '1', target: '5' }, { source: '2', target: '6' },
    { source: '3', target: '7' }, { source: '3', target: '8' }, { source: '4', target: '9' },
    { source: '6', target: '10' }, { source: '7', target: '11' }, { source: '5', target: '10' },
  ],
};

// 稀疏自然网络(force):16 节点,适度连接,力导向能自然散开
const mesh = {
  nodes: Array.from({ length: 16 }, (_, i) => ({ id: String(i) })),
  edges: [
    { source: '0', target: '1' }, { source: '0', target: '2' }, { source: '1', target: '3' },
    { source: '2', target: '3' }, { source: '3', target: '4' }, { source: '4', target: '5' },
    { source: '4', target: '6' }, { source: '5', target: '7' }, { source: '6', target: '7' },
    { source: '2', target: '8' }, { source: '8', target: '9' }, { source: '8', target: '10' },
    { source: '9', target: '11' }, { source: '10', target: '11' }, { source: '7', target: '12' },
    { source: '12', target: '13' }, { source: '12', target: '14' }, { source: '13', target: '15' },
    { source: '14', target: '15' }, { source: '11', target: '12' },
  ],
};

// 放射树(radial):单根 + 多层向外,呈现真正的辐射形态
const radialTree = {
  nodes: Array.from({ length: 17 }, (_, i) => ({ id: String(i) })),
  edges: [
    { source: '0', target: '1' }, { source: '0', target: '2' }, { source: '0', target: '3' },
    { source: '0', target: '4' }, { source: '1', target: '5' }, { source: '1', target: '6' },
    { source: '2', target: '7' }, { source: '2', target: '8' }, { source: '3', target: '9' },
    { source: '3', target: '10' }, { source: '4', target: '11' }, { source: '4', target: '12' },
    { source: '5', target: '13' }, { source: '7', target: '14' }, { source: '9', target: '15' },
    { source: '11', target: '16' },
  ],
};

// 树(dagre / mindmap);mindmap 布局会往 node.data 写 _branchColor,故带上 data
const tree = {
  nodes: Array.from({ length: 13 }, (_, i) => ({ id: String(i), data: {} })),
  edges: [
    { source: '0', target: '1' }, { source: '0', target: '2' }, { source: '0', target: '3' },
    { source: '1', target: '4' }, { source: '1', target: '5' }, { source: '2', target: '6' },
    { source: '2', target: '7' }, { source: '3', target: '8' }, { source: '3', target: '9' },
    { source: '4', target: '10' }, { source: '6', target: '11' }, { source: '8', target: '12' },
  ],
};

const CONFIGS: Record<string, Cfg> = {
  force: { layout: { type: 'd3-force', linkDistance: 90 }, data: mesh },
  circular: { layout: { type: 'circular', radius: 80 }, data: net },
  radial: { layout: { type: 'radial', unitRadius: 80, linkDistance: 80 }, data: radialTree },
  dagre: { layout: { type: 'dagre', rankdir: 'TB', nodesep: 24, ranksep: 36 }, data: tree },
  grid: { layout: { type: 'grid', rows: 3, cols: 4 }, data: net },
  mindmap: { layout: { type: 'mindmap', direction: 'H', levelGap: 70, nodeGap: 20 }, data: tree },
};

async function main() {
  const { Graph } = await import('../src/index.ts');
  const [type, color] = window.location.hash.slice(1).split('|');
  const cfg = CONFIGS[type] ?? CONFIGS.force;
  const accent = color ? `#${color}` : '#5B8FF9';

  const graph = new Graph({
    container: '#stage',
    data: cfg.data,
    node: { type: 'circle', style: { size: 12, fill: accent, stroke: '#ffffff', strokeWidth: 2 } },
    edge: { type: cfg.layout.type === 'mindmap' ? 'cubic' : 'line', style: { stroke: accent, opacity: 0.45, lineWidth: 1.5 } },
    layout: cfg.layout,
    theme: 'light',
  });
  await graph.render();
  // render 内部会画一帧默认相机、再 fitView 改相机;preserveDrawingBuffer 下两帧叠加成重影。
  // 等一帧后强制重绘一次,WebGL 会先 clear 再画,只保留最终干净帧。
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  graph.fitView();
  graph.scheduleRender();
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  // 标记渲染完成,供 playwright 等待
  (window as unknown as { __ready: boolean }).__ready = true;
}

void main();
