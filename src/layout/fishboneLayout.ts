/**
 * Fishbone Layout (Ishikawa Diagram)
 * Two-level tree: head -> categories -> items
 *
 * Spine geometry (LR direction):
 *   - Spine anchor[i] sits at (spineX[i], centerY)
 *   - Category node is offset LEFT by categoryDistance:
 *       cat.x = spineX[i] - categoryDistance
 *       cat.y = centerY +/- categoryDistance   (45 degree diagonal bone)
 *   - Items staircase away from the category in the same direction
 */

import type { GraphData, GraphNode } from '../types';

export interface FishboneLayoutOptions {
  direction?: 'LR' | 'RL';
  categoryGap?: number;
  itemGap?: number;
  itemHStep?: number;
  categoryDistance?: number;
  getWidth?: (node: GraphNode) => number;
  getHeight?: (node: GraphNode) => number;
}

interface TreeNode {
  id: string;
  children: TreeNode[];
  x: number;
  y: number;
  width: number;
  height: number;
}

type LayoutResult = { nodes: Array<GraphNode & { x: number; y: number }> };

/** Execute the fishbone layout without retaining state or mutating the input data. */
export function executeFishboneLayout(
  data: GraphData,
  options: FishboneLayoutOptions = {},
): LayoutResult {
  const direction = options.direction ?? 'LR';
  const categoryGap = options.categoryGap ?? 180;
  const itemHStep = options.itemHStep ?? 20;
  const categoryDistance = options.categoryDistance ?? 200;
  const getWidth = options.getWidth ?? (() => 80);
  const getHeight = options.getHeight ?? (() => 30);

  const nodeMap = new Map<string, TreeNode>();
  const childrenMap = new Map<string, string[]>();
  const hasParent = new Set<string>();

  for (const node of data.nodes) {
    nodeMap.set(node.id, {
      id: node.id,
      children: [],
      x: 0,
      y: 0,
      width: getWidth(node),
      height: getHeight(node),
    });
  }

  for (const edge of data.edges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) continue;
    let childIds = childrenMap.get(edge.source);
    if (!childIds) {
      childIds = [];
      childrenMap.set(edge.source, childIds);
    }
    childIds.push(edge.target);
    hasParent.add(edge.target);
  }

  const rootId = data.nodes.find((node) => !hasParent.has(node.id))?.id;
  const root = rootId ? nodeMap.get(rootId) : undefined;
  if (!root) return { nodes: data.nodes.map((node) => ({ ...node, x: 0, y: 0 })) };

  const visited = new Set<string>([root.id]);
  const stack: Array<{ node: TreeNode; childIndex: number }> = [{ node: root, childIndex: 0 }];

  while (stack.length > 0) {
    const frame = stack[stack.length - 1];
    const childIds = childrenMap.get(frame.node.id) ?? [];
    if (frame.childIndex >= childIds.length) {
      stack.pop();
      continue;
    }

    const childId = childIds[frame.childIndex];
    frame.childIndex += 1;
    const child = nodeMap.get(childId);
    if (!child || visited.has(childId)) continue;

    visited.add(childId);
    frame.node.children.push(child);
    stack.push({ node: child, childIndex: 0 });
  }

  const categories = root.children;
  const categoryCount = categories.length;

  if (categoryCount === 0) {
    root.x = 450;
    root.y = 300;
  } else {
    const centerY = categoryDistance + 80;
    const leftMargin = categoryDistance + 20;
    const spineLength = categoryCount * categoryGap;

    root.x = leftMargin + spineLength + root.width / 2;
    root.y = centerY;

    for (let index = 0; index < categoryCount; index += 1) {
      const category = categories[index];
      const verticalDirection = index % 2 === 0 ? -1 : 1;
      const spineX = leftMargin + (index + 0.5) * categoryGap;

      category.x = spineX - categoryDistance;
      category.y = centerY + verticalDirection * categoryDistance;

      const itemCount = category.children.length;
      for (let itemIndex = 0; itemIndex < itemCount; itemIndex += 1) {
        const item = category.children[itemIndex];
        const ratio = (itemIndex + 1) / (itemCount + 1);
        const yOffset = ratio * categoryDistance;
        const meetX = category.x + yOffset;
        item.x = meetX - itemHStep - item.width / 2;
        item.y = category.y - verticalDirection * yOffset;
      }
    }

    if (direction === 'RL') {
      const totalWidth = leftMargin + spineLength + root.width;
      const pending = [root];
      while (pending.length > 0) {
        const node = pending.pop();
        if (!node) break;
        node.x = totalWidth - node.x;
        pending.push(...node.children);
      }
    }
  }

  return {
    nodes: data.nodes.map((node) => {
      const layoutNode = visited.has(node.id) ? nodeMap.get(node.id) : undefined;
      return {
        ...node,
        x: layoutNode?.x ?? 0,
        y: layoutNode?.y ?? 0,
      };
    }),
  };
}
