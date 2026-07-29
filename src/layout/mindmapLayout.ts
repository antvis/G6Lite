/**
 * Mind Map Layout: horizontal tree with root at center, children expand to left/right.
 * Reference: G6 mindmap layout
 */

import { ANTV_CATEGORY_10 } from '../palette';
import type { GraphData, GraphNode } from '../types';

export interface MindmapLayoutOptions {
  direction?: 'H' | 'LR' | 'RL';
  levelGap?: number;
  nodeGap?: number;
  branchColors?: string[];
  getWidth?: (node: GraphNode) => number;
  getHeight?: (node: GraphNode) => number;
  getSide?: (node: GraphNode, index: number, parentSide?: 'left' | 'right') => 'left' | 'right';
}

interface TreeNode {
  id: string;
  data: GraphNode['data'];
  children: TreeNode[];
  x: number;
  y: number;
  width: number;
  height: number;
  side?: 'left' | 'right';
  depth: number;
}

type ResolvedMindmapLayoutOptions = Required<MindmapLayoutOptions>;

const DEFAULT_LEVEL_GAP = 120;
const DEFAULT_NODE_GAP = 30;
const DEFAULT_NODE_WIDTH = 100;
const DEFAULT_NODE_HEIGHT = 40;
const DEFAULT_BRANCH_COLORS = ANTV_CATEGORY_10;

export function executeMindmapLayout(
  data: GraphData,
  options: MindmapLayoutOptions = {},
): { nodes: Array<GraphNode & { x: number; y: number }> } {
  const inputNodes = Array.isArray(data?.nodes) ? data.nodes : [];
  if (inputNodes.length === 0) return { nodes: [] };

  const resolvedOptions: ResolvedMindmapLayoutOptions = {
    direction: options.direction ?? 'H',
    levelGap: options.levelGap ?? DEFAULT_LEVEL_GAP,
    nodeGap: options.nodeGap ?? DEFAULT_NODE_GAP,
    branchColors: [...(options.branchColors ?? DEFAULT_BRANCH_COLORS)],
    getWidth: options.getWidth ?? (() => DEFAULT_NODE_WIDTH),
    getHeight: options.getHeight ?? (() => DEFAULT_NODE_HEIGHT),
    getSide: options.getSide ?? (() => 'right'),
  };

  const nodeMap = new Map<string, TreeNode>();
  const childrenMap = new Map<string, string[]>();
  const hasParent = new Set<string>();

  for (const node of inputNodes) {
    if (nodeMap.has(node.id)) continue;
    nodeMap.set(node.id, {
      id: node.id,
      data: node.data ? { ...node.data } : undefined,
      children: [],
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      depth: 0,
    });
  }

  for (const edge of Array.isArray(data.edges) ? data.edges : []) {
    const { source, target } = edge;
    if (source === target || !nodeMap.has(source) || !nodeMap.has(target)) continue;
    // A mind map is a tree. Keep the first valid parent so malformed multi-parent
    // input cannot add the same TreeNode to multiple branches.
    if (hasParent.has(target)) continue;
    const children = childrenMap.get(source) ?? [];
    if (children.includes(target)) continue;
    children.push(target);
    childrenMap.set(source, children);
    hasParent.add(target);
  }

  const rootId = inputNodes.find((node) => nodeMap.has(node.id) && !hasParent.has(node.id))?.id;
  // A graph made entirely of cycles has no natural root. Falling back to the
  // first node keeps the result deterministic; the DFS guard below cuts cycles.
  const rootNode = nodeMap.get(rootId ?? inputNodes[0].id);
  if (!rootNode) {
    return {
      nodes: inputNodes.map((node) => ({
        ...node,
        data: node.data ? { ...node.data } : undefined,
        x: 0,
        y: 0,
      })),
    };
  }

  const visited = new Set<string>();
  const visiting = new Set<string>();

  const buildChildren = (node: TreeNode, depth: number): void => {
    if (visiting.has(node.id) || visited.has(node.id)) return;
    visiting.add(node.id);
    visited.add(node.id);
    node.depth = depth;

    for (const childId of childrenMap.get(node.id) ?? []) {
      if (visiting.has(childId) || visited.has(childId)) continue;
      const child = nodeMap.get(childId);
      if (!child) continue;
      node.children.push(child);
      buildChildren(child, depth + 1);
    }

    visiting.delete(node.id);
  };

  buildChildren(rootNode, 0);

  const toCallbackNode = (node: TreeNode): GraphNode => ({
    id: node.id,
    data: node.data ? { ...node.data } : undefined,
  });

  const calculateSizes = (node: TreeNode): void => {
    const graphNode = toCallbackNode(node);
    node.width = resolvedOptions.getWidth(graphNode);
    node.height = resolvedOptions.getHeight(graphNode);
    node.children.forEach(calculateSizes);
  };

  const assignSides = (node: TreeNode, parentSide?: 'left' | 'right'): void => {
    if (node.children.length === 0) return;

    if (node.depth === 0) {
      if (resolvedOptions.direction === 'H') {
        node.children.forEach((child, index) => {
          child.side = resolvedOptions.getSide(toCallbackNode(child), index, undefined);
        });
      } else {
        const side = resolvedOptions.direction === 'LR' ? 'right' : 'left';
        node.children.forEach((child) => {
          child.side = side;
        });
      }
    } else {
      node.children.forEach((child, index) => {
        child.side = resolvedOptions.getSide(toCallbackNode(child), index, parentSide);
      });
    }

    // Preserve the previous layout's parent-side propagation semantics.
    node.children.forEach((child) => assignSides(child, node.side));
  };

  const assignBranchColor = (node: TreeNode, colorIndex: number): void => {
    const { branchColors } = resolvedOptions;
    if (branchColors.length > 0) {
      const color = branchColors[colorIndex % branchColors.length];
      node.data = { ...(node.data ?? {}), _branchColor: color };
    }
    node.children.forEach((child) => assignBranchColor(child, colorIndex));
  };

  const getChildrenHeight = (children: TreeNode[]): number => {
    if (children.length === 0) return 0;
    return children.reduce(
      (total, child, index) =>
        total + child.height + (index < children.length - 1 ? resolvedOptions.nodeGap : 0),
      0,
    );
  };

  const calculatePositions = (node: TreeNode): void => {
    if (node.children.length === 0) return;

    const leftChildren: TreeNode[] = [];
    const rightChildren: TreeNode[] = [];
    for (const child of node.children) {
      (child.side === 'left' ? leftChildren : rightChildren).push(child);
    }

    if (rightChildren.length > 0) {
      let yOffset = node.y - getChildrenHeight(rightChildren) / 2;
      for (const child of rightChildren) {
        child.x = node.x + node.width / 2 + resolvedOptions.levelGap + child.width / 2;
        child.y = yOffset + child.height / 2;
        yOffset += child.height + resolvedOptions.nodeGap;
        assignBranchColor(child, 1);
        calculatePositions(child);
      }
    }

    if (leftChildren.length > 0) {
      let yOffset = node.y - getChildrenHeight(leftChildren) / 2;
      for (const child of leftChildren) {
        child.x = node.x - node.width / 2 - resolvedOptions.levelGap - child.width / 2;
        child.y = yOffset + child.height / 2;
        yOffset += child.height + resolvedOptions.nodeGap;
        assignBranchColor(child, 0);
        calculatePositions(child);
      }
    }
  };

  rootNode.x = 0;
  rootNode.y = 0;
  calculateSizes(rootNode);
  assignSides(rootNode);
  calculatePositions(rootNode);

  return {
    nodes: inputNodes.map((node) => {
      const layoutNode = nodeMap.get(node.id);
      const positioned = layoutNode && visited.has(layoutNode.id);
      return {
        ...node,
        data: layoutNode?.data ? { ...layoutNode.data } : undefined,
        x: positioned ? layoutNode.x : 0,
        y: positioned ? layoutNode.y : 0,
      };
    }),
  };
}
