/**
 * 截图页:用真实 g6-lite 渲染单个布局,供 scripts/capture-thumbnails 截图。
 * 布局与配色由 URL hash 决定,如 #force|5B8FF9
 *
 * 逐节点的颜色/大小写入 node.data(color/size),由 node.style 的回调函数读取。
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

type Node = { id: string; data: { color: string; size: number } };
type Edge = { source: string; target: string };
type Cfg = { layout: Record<string, unknown>; data: { nodes: Node[]; edges: Edge[] } };

// AntV 分类色板(10 色),用于社群着色,让缩略图饱满有层次。
const PALETTE = [
  '#5B8FF9', '#61DDAA', '#65789B', '#F6BD16', '#7262FD',
  '#78D3F8', '#9661BC', '#F6903D', '#008685', '#F08BB4',
];

// 确定性伪随机(mulberry32),保证每次生成的图完全一致、可复现。
function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 程序化生成社群网络:clusters 个社群,每个社群内部稠密相连,社群间稀疏桥接。
 * 节点按社群分配 PALETTE 颜色,大小随机抖动 —— 渲染出来饱满、有聚类感、彩色。
 */
function communityGraph(opts: { clusters: number; perCluster: number; seed: number }) {
  const r = rng(opts.seed);
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const clusterNodes: string[][] = [];

  let id = 0;
  for (let c = 0; c < opts.clusters; c++) {
    const color = PALETTE[c % PALETTE.length];
    const count = Math.round(opts.perCluster * (0.6 + r() * 0.8));
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      const nid = String(id++);
      ids.push(nid);
      nodes.push({ id: nid, data: { color, size: 6 + Math.round(r() * 12) } });
    }
    clusterNodes.push(ids);
    // 社群内部:每个节点连 1~3 条到同社群其他节点,形成稠密簇
    for (let i = 0; i < ids.length; i++) {
      const links = 1 + Math.floor(r() * 3);
      for (let k = 0; k < links; k++) {
        const j = Math.floor(r() * ids.length);
        if (j !== i) edges.push({ source: ids[i], target: ids[j] });
      }
    }
  }

  // 社群间:少量桥接边,把簇松散连起来
  for (let c = 0; c < clusterNodes.length; c++) {
    const bridges = 1 + Math.floor(r() * 2);
    for (let b = 0; b < bridges; b++) {
      const c2 = Math.floor(r() * clusterNodes.length);
      if (c2 === c) continue;
      const a = clusterNodes[c][Math.floor(r() * clusterNodes[c].length)];
      const d = clusterNodes[c2][Math.floor(r() * clusterNodes[c2].length)];
      edges.push({ source: a, target: d });
    }
  }

  return { nodes, edges };
}

// 较大的环形/网格网络(circular / grid):多节点 + 多色,排布规整也饱满
function ringGraph(opts: { count: number; seed: number }) {
  const r = rng(opts.seed);
  const nodes: Node[] = Array.from({ length: opts.count }, (_, i) => ({
    id: String(i),
    data: { color: PALETTE[i % PALETTE.length], size: 8 + Math.round(r() * 8) },
  }));
  const edges: Edge[] = [];
  for (let i = 0; i < opts.count; i++) {
    edges.push({ source: String(i), target: String((i + 1) % opts.count) });
    if (r() > 0.5) edges.push({ source: String(i), target: String((i + 3) % opts.count) });
  }
  return { nodes, edges };
}

/**
 * 生成多层树:branching 分叉、depth 层。按子树根分配颜色,使每个分支一种颜色。
 */
function treeGraph(opts: { branching: number; depth: number; seed: number }) {
  const r = rng(opts.seed);
  const nodes: Node[] = [{ id: '0', data: { color: PALETTE[0], size: 16 } }];
  const edges: Edge[] = [];
  let id = 1;
  let frontier: { id: string; color: number }[] = [{ id: '0', color: -1 }];
  for (let d = 0; d < opts.depth; d++) {
    const next: { id: string; color: number }[] = [];
    for (const parent of frontier) {
      const kids = Math.max(1, Math.round(opts.branching * (0.5 + r())));
      for (let k = 0; k < kids; k++) {
        const nid = String(id++);
        // 第一层确定分支色,之后沿用父节点的分支色
        const colorIdx = parent.color < 0 ? next.length % PALETTE.length : parent.color;
        nodes.push({ id: nid, data: { color: PALETTE[colorIdx % PALETTE.length], size: Math.max(6, 14 - d * 2) } });
        edges.push({ source: parent.id, target: nid });
        next.push({ id: nid, color: colorIdx });
      }
    }
    frontier = next;
  }
  return { nodes, edges };
}

const CONFIGS: Record<string, Cfg> = {
  // 力导向:7 社群约 180 节点,自然聚类,最能体现"大规模图"的饱满感
  force: { layout: { type: 'd3-force', linkDistance: 40, nodeStrength: -30 }, data: communityGraph({ clusters: 7, perCluster: 26, seed: 7 }) },
  // 环形:48 节点彩色环
  circular: { layout: { type: 'circular', radius: 150 }, data: ringGraph({ count: 48, seed: 3 }) },
  // 辐射:多层树单根向外辐射,层次清晰
  radial: { layout: { type: 'radial', unitRadius: 70, linkDistance: 50 }, data: treeGraph({ branching: 3, depth: 3, seed: 11 }) },
  // 层级 DAG:分叉树
  dagre: { layout: { type: 'dagre', rankdir: 'TB', nodesep: 14, ranksep: 28 }, data: treeGraph({ branching: 2.4, depth: 4, seed: 5 }) },
  // 网格:60 节点彩色网格
  grid: { layout: { type: 'grid', rows: 6, cols: 10 }, data: ringGraph({ count: 60, seed: 9 }) },
  // 脑图:横向分叉树
  mindmap: { layout: { type: 'mindmap', direction: 'H', levelGap: 60, nodeGap: 12 }, data: treeGraph({ branching: 2.6, depth: 3, seed: 2 }) },
};

async function main() {
  const { Graph } = await import('../src/index.ts');
  const [type, fallback] = window.location.hash.slice(1).split('|');
  const cfg = CONFIGS[type] ?? CONFIGS.force;
  const accent = fallback ? `#${fallback}` : '#5B8FF9';

  const graph = new Graph({
    container: '#stage',
    data: cfg.data,
    // 逐节点颜色/大小从 data 读取(回调),整体描边白色,做出"卡片化"清爽感
    node: {
      type: 'circle',
      style: {
        fill: (d: { data?: { color?: string } }) => d.data?.color ?? accent,
        size: (d: { data?: { size?: number } }) => d.data?.size ?? 10,
        stroke: '#ffffff',
        strokeWidth: 1.5,
      },
    },
    edge: { type: cfg.layout.type === 'mindmap' ? 'cubic' : 'line', style: { stroke: '#c4cdd8', opacity: 0.5, lineWidth: 1 } },
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
