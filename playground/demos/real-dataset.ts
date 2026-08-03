/**
 * Demo: 真实数据集 — sigma.js 官网首页同款数据
 *
 * 两个数据集来自 sigma.js 官方仓库(MIT),由 scripts/fetch-sigma-datasets.mjs 转换:
 *  - wikipedia.json   2085 节点 / 5409 边   (v3 官网首页:数据可视化维基百科网络)
 *  - ai-papers.json   8798 节点 / 71077 边  (v4 官网首页:高被引 AI 论文引用网络)
 *
 * 节点自带 sigma 预跑好的 ForceAtlas2 坐标,这里直接复用预置布局(不重跑 layout),
 * 用于横向对比 G6Lite 与 sigma.js 在相同真实数据上的渲染表现。
 */
import { Graph, type GraphData } from '../../src/index.ts';

// 切换这里即可换数据集
const DATASET = new URL('../datasets/ai-papers.json', import.meta.url).href;

// 聚类调色板(cluster -> color),覆盖两个数据集的常见 class 数量
const PALETTE = [
  '#5B8FF9', '#61DDAA', '#F6BD16', '#7262FD', '#78D3F8',
  '#9661BC', '#F6903D', '#008685', '#F08BB4', '#E8684A',
];

export async function run(container: string | HTMLElement) {
  const data: GraphData = await fetch(DATASET).then((r) => r.json());

  const graph = new Graph({
    container,
    data,
    node: {
      type: 'circle',
      style: {
        // 优先用数据自带 color(wikipedia),否则按 cluster 取色板(ai-papers)
        fill: (d) => {
          const c = d.data?.color as string | undefined;
          if (c) return c;
          const idx = parseInt((d.data?.cluster as string) ?? '0', 10) || 0;
          return PALETTE[idx % PALETTE.length];
        },
        size: 4,
      },
    },
    edge: { type: 'line', style: { lineWidth: 0.4, stroke: '#ccc' } },
    // 复用预置坐标:不配置 layout
    behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node'],
    theme: 'light',
  });

  await graph.render();
  return graph;
}
