/**
 * Indented Tree Layout — 缩进树布局
 *
 * 将树形数据按缩进方式排列：x 由深度决定，y 由 DFS 遍历顺序决定。
 * 适用于文件目录、分类层级等场景。
 *
 * 支持内置色板：通过 nodeColors / edgeColors 按深度自动分配颜色，
 * 结果写入 node.data._nodeColor / node.data._edgeColor，供样式函数读取。
 */

import type { GraphData } from '../types.js';

/** Default palette when nodeColors / edgeColors are enabled but not specified. */
const DEFAULT_PALETTE = ['#1783FF', '#F08F56', '#00C9C9', '#D580FF', '#7863FF'];

export class IndentedLayout {
  private opts: {
    indent: number;
    rowHeight: number;
    direction: 'LR' | 'RL';
    rootId?: string;
    nodeColors?: string[];
    edgeColors?: string[];
  };
  private nodes: Array<{ id: string; x: number; y: number }> = [];

  constructor(opts?: Record<string, unknown>) {
    this.opts = {
      indent: (opts?.indent as number) ?? 80,
      rowHeight: (opts?.rowHeight as number) ?? 40,
      direction: (opts?.direction as 'LR' | 'RL') ?? 'LR',
      rootId: opts?.rootId as string | undefined,
      nodeColors: opts?.nodeColors as string[] | undefined,
      edgeColors: opts?.edgeColors as string[] | undefined,
    };
  }

  async execute(data: GraphData): Promise<void> {
    const { indent, rowHeight, direction, rootId, nodeColors, edgeColors } = this.opts;
    const { nodes, edges } = data;

    if (nodes.length === 0) return;

    // Build adjacency list
    const children = new Map<string, string[]>();
    const hasParent = new Set<string>();
    for (const e of edges) {
      if (!children.has(e.source)) children.set(e.source, []);
      children.get(e.source)!.push(e.target);
      hasParent.add(e.target);
    }

    // Find root
    const root = rootId ?? nodes.find(n => !hasParent.has(n.id))?.id ?? nodes[0].id;

    // Resolve palettes
    const nPalette = nodeColors ?? (nodeColors === undefined ? undefined : DEFAULT_PALETTE);
    const ePalette = edgeColors ?? (edgeColors === undefined ? undefined : DEFAULT_PALETTE);

    // DFS to assign coordinates and colors
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    let rowIndex = 0;
    this.nodes = [];

    const dfs = (id: string, depth: number) => {
      const node = nodeMap.get(id);
      if (!node) return;

      const baseX = direction === 'LR' ? depth * indent : -(depth * indent);
      const x = baseX;
      const y = rowIndex * rowHeight;
      rowIndex++;

      // Write metadata into node.data
      if (!node.data) node.data = {};
      const d = node.data as Record<string, unknown>;
      d.depth = depth;
      d._isRoot = depth === 0;
      if (nPalette) d._nodeColor = nPalette[depth % nPalette.length];
      if (ePalette) d._edgeColor = ePalette[depth % ePalette.length];

      node.x = x;
      node.y = y;
      this.nodes.push({ id, x, y });

      const kids = children.get(id) ?? [];
      for (const kid of kids) {
        dfs(kid, depth + 1);
      }
    };

    dfs(root, 0);
  }

  forEachNode(fn: (n: { id: string; x: number; y: number }) => void): void {
    this.nodes.forEach(fn);
  }
}
