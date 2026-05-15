/**
 * Mind Map Layout: horizontal tree with root at center, children expand to left/right.
 * Reference: G6 mindmap layout
 */

import type { GraphData, GraphNode } from '../types.js';

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

type LayoutInstance = {
  execute: (data: GraphData) => Promise<void>;
  forEachNode: (
    fn: (n: { id: string; x: number; y: number; data?: Record<string, unknown> }) => void,
  ) => void;
};

const DEFAULT_LEVEL_GAP = 120;
const DEFAULT_NODE_GAP = 30;
const DEFAULT_NODE_WIDTH = 100;
const DEFAULT_NODE_HEIGHT = 40;
const DEFAULT_BRANCH_COLORS = [
  '#5B8FF9',
  '#F6BD16',
  '#5AD8A6',
  '#5D7092',
  '#E8684A',
  '#6F5EF9',
  '#C6E5FF',
  '#FFD8B8',
];

export class MindmapLayout implements LayoutInstance {
  private options: Required<MindmapLayoutOptions>;
  private rootNode: TreeNode | null = null;

  constructor(options?: MindmapLayoutOptions) {
    this.options = {
      direction: options?.direction ?? 'H',
      levelGap: options?.levelGap ?? DEFAULT_LEVEL_GAP,
      nodeGap: options?.nodeGap ?? DEFAULT_NODE_GAP,
      branchColors: options?.branchColors ?? DEFAULT_BRANCH_COLORS,
      getWidth: options?.getWidth ?? (() => DEFAULT_NODE_WIDTH),
      getHeight: options?.getHeight ?? (() => DEFAULT_NODE_HEIGHT),
      getSide: options?.getSide ?? (() => 'right'),
    };
  }

  async execute(data: GraphData): Promise<void> {
    this.buildTree(data);
    if (!this.rootNode) return;

    // Root at center
    this.rootNode.x = 0;
    this.rootNode.y = 0;

    // Assign sides recursively
    this.assignSides(this.rootNode, undefined);

    // Calculate positions
    this.calcPositions(this.rootNode);
  }

  private getAllPositions(): string[] {
    const positions: string[] = [];
    const collect = (node: TreeNode | null) => {
      if (!node) return;
      positions.push(`${node.id}:(${Math.round(node.x)},${Math.round(node.y)})`);
      node.children.forEach(collect);
    };
    collect(this.rootNode);
    return positions;
  }

  forEachNode(
    fn: (n: { id: string; x: number; y: number; data?: Record<string, unknown> }) => void,
  ): void {
    const collect = (node: TreeNode | null) => {
      if (!node) return;
      fn({ id: node.id, x: node.x, y: node.y, data: node.data as Record<string, unknown> });
      node.children.forEach(collect);
    };
    collect(this.rootNode);
  }

  private buildTree(data: GraphData): void {
    const nodeMap = new Map<string, TreeNode>();
    const childrenMap = new Map<string, string[]>();
    const hasParent = new Set<string>();

    // Initialize nodes
    for (const node of data.nodes) {
      nodeMap.set(node.id, {
        id: node.id,
        data: node.data,
        children: [],
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        depth: 0,
      });
    }

    // Build relationships
    for (const edge of data.edges) {
      const parentId = edge.source;
      const childId = edge.target;
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(childId);
      hasParent.add(childId);
    }

    // Find root
    let rootId: string | undefined;
    for (const node of data.nodes) {
      if (!hasParent.has(node.id)) {
        rootId = node.id;
        break;
      }
    }

    if (!rootId || !nodeMap.has(rootId)) {
      this.rootNode = null;
      return;
    }

    // Build tree
    const buildChildren = (parentId: string, depth: number): void => {
      const parent = nodeMap.get(parentId)!;
      parent.depth = depth;
      const childIds = childrenMap.get(parentId) || [];
      for (const childId of childIds) {
        const child = nodeMap.get(childId)!;
        parent.children.push(child);
        buildChildren(childId, depth + 1);
      }
    };

    this.rootNode = nodeMap.get(rootId)!;
    buildChildren(rootId, 0);

    // Calculate sizes
    const calcSize = (node: TreeNode): void => {
      const graphNode = { id: node.id, data: node.data } as GraphNode;
      node.width = this.options.getWidth(graphNode);
      node.height = this.options.getHeight(graphNode);
      node.children.forEach(calcSize);
    };
    calcSize(this.rootNode);
  }

  private assignSides(node: TreeNode, parentSide?: 'left' | 'right'): void {
    if (node.children.length === 0) return;

    if (node.depth === 0) {
      // Root: assign first-level children based on direction
      if (this.options.direction === 'H') {
        node.children.forEach((child, idx) => {
          const graphNode = { id: child.id, data: child.data } as GraphNode;
          child.side = this.options.getSide!(graphNode, idx, undefined);
        });
      } else if (this.options.direction === 'LR') {
        node.children.forEach((child) => {
          child.side = 'right';
        });
      } else if (this.options.direction === 'RL') {
        node.children.forEach((child) => {
          child.side = 'left';
        });
      }
    } else {
      // Non-root: children expand to opposite side of parent
      const expandSide = parentSide === 'left' ? 'right' : 'left';
      node.children.forEach((child, idx) => {
        const graphNode = { id: child.id, data: child.data } as GraphNode;
        child.side = this.options.getSide!(graphNode, idx, parentSide);
      });
    }

    // Recursively assign to children
    node.children.forEach((child) => this.assignSides(child, node.side));
  }

  private calcPositions(node: TreeNode): void {
    if (node.children.length === 0) return;

    const { levelGap, nodeGap } = this.options;

    // Group by side
    const leftChildren: TreeNode[] = [];
    const rightChildren: TreeNode[] = [];

    for (const child of node.children) {
      if (child.side === 'left') {
        leftChildren.push(child);
      } else {
        rightChildren.push(child);
      }
    }

    // Calculate height for each side
    const getHeight = (children: TreeNode[]): number => {
      if (children.length === 0) return 0;
      let total = 0;
      for (let i = 0; i < children.length; i++) {
        total += children[i].height;
        if (i < children.length - 1) total += nodeGap;
      }
      return total;
    };

    const rightHeight = getHeight(rightChildren);
    const leftHeight = getHeight(leftChildren);

    // Position right children (expand to right from parent)
    if (rightChildren.length > 0) {
      let yOffset = node.y - rightHeight / 2;
      for (const child of rightChildren) {
        // Child expands to right: x = parent right edge + levelGap + child half width
        child.x = node.x + node.width / 2 + levelGap + child.width / 2;
        child.y = yOffset + child.height / 2;
        yOffset += child.height + nodeGap;
        this.assignBranchColor(child, 1);
        this.calcPositions(child);
      }
    }

    // Position left children (expand to left from parent)
    if (leftChildren.length > 0) {
      let yOffset = node.y - leftHeight / 2;
      for (const child of leftChildren) {
        // Child expands to left: x = parent left edge - levelGap - child half width
        child.x = node.x - node.width / 2 - levelGap - child.width / 2;
        child.y = yOffset + child.height / 2;
        yOffset += child.height + nodeGap;
        this.assignBranchColor(child, 0);
        this.calcPositions(child);
      }
    }
  }

  private assignBranchColor(node: TreeNode, colorIndex: number): void {
    const color = this.options.branchColors[colorIndex % this.options.branchColors.length];
    (node.data as Record<string, unknown>)._branchColor = color;
    for (const child of node.children) {
      this.assignBranchColor(child, colorIndex);
    }
  }
}
