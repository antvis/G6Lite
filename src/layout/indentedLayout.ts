/**
 * Indented Tree Layout — 缩进树布局
 *
 * 将树形数据按缩进方式排列：x 由深度决定，y 由 DFS 遍历顺序决定。
 * 适用于文件目录、分类层级等场景。
 *
 * 支持内置色板：通过 nodeColors / edgeColors 按深度自动分配颜色，
 * 结果写入返回节点的 data._nodeColor / data._edgeColor，供样式函数读取。
 */

import { ANTV_CATEGORY_10 } from '../palette';
import type { GraphData, GraphNode } from '../types';

/** Default palette when nodeColors / edgeColors are enabled but not specified. */
const DEFAULT_PALETTE = ANTV_CATEGORY_10;

export interface IndentedLayoutOptions {
  indent?: number;
  rowHeight?: number;
  direction?: 'LR' | 'RL';
  rootId?: string;
  nodeColors?: string[];
  edgeColors?: string[];
}

type LayoutResult = { nodes: Array<GraphNode & { x: number; y: number }> };

/** Execute the indented tree layout without retaining state or mutating the input data. */
export function executeIndentedLayout(
  data: GraphData,
  options: IndentedLayoutOptions = {},
): LayoutResult {
  const indent = options.indent ?? 80;
  const rowHeight = options.rowHeight ?? 40;
  const direction = options.direction ?? 'LR';
  const { rootId, nodeColors, edgeColors } = options;
  const { nodes, edges } = data;

  if (nodes.length === 0) return { nodes: [] };

  const children = new Map<string, string[]>();
  const hasParent = new Set<string>();
  const nodeIds = new Set(nodes.map((node) => node.id));
  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue;
    let childIds = children.get(edge.source);
    if (!childIds) {
      childIds = [];
      children.set(edge.source, childIds);
    }
    childIds.push(edge.target);
    hasParent.add(edge.target);
  }

  const root = rootId ?? nodes.find((node) => !hasParent.has(node.id))?.id ?? nodes[0].id;
  const nPalette = nodeColors ?? (nodeColors === undefined ? undefined : DEFAULT_PALETTE);
  const ePalette = edgeColors ?? (edgeColors === undefined ? undefined : DEFAULT_PALETTE);
  const positions = new Map<string, { x: number; y: number; depth: number }>();
  const visited = new Set<string>();
  const stack: Array<{ id: string; depth: number }> = [{ id: root, depth: 0 }];
  let rowIndex = 0;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) break;
    if (!nodeIds.has(current.id) || visited.has(current.id)) continue;
    visited.add(current.id);

    const x = direction === 'LR' ? current.depth * indent : -(current.depth * indent);
    const y = rowIndex * rowHeight;
    rowIndex += 1;
    positions.set(current.id, {
      x,
      y,
      depth: current.depth,
    });

    const childIds = children.get(current.id) ?? [];
    for (let index = childIds.length - 1; index >= 0; index -= 1) {
      stack.push({ id: childIds[index], depth: current.depth + 1 });
    }
  }

  return {
    nodes: nodes.map((node) => {
      const position = positions.get(node.id);
      if (!position) return { ...node, x: 0, y: 0 };

      const nextData: Record<string, unknown> = {
        ...node.data,
        depth: position.depth,
        _isRoot: position.depth === 0,
      };
      if (nPalette) nextData._nodeColor = nPalette[position.depth % nPalette.length];
      if (ePalette) nextData._edgeColor = ePalette[position.depth % ePalette.length];

      return { ...node, data: nextData, x: position.x, y: position.y };
    }),
  };
}
