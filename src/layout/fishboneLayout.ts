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

import type { GraphData, GraphNode } from '../types.js';

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
  data: Record<string, unknown>;
  children: TreeNode[];
  x: number;
  y: number;
  width: number;
  height: number;
}

export class FishboneLayout {
  private opts: Required<FishboneLayoutOptions>;
  private tree: TreeNode | null = null;

  constructor(options?: FishboneLayoutOptions) {
    this.opts = {
      direction: options?.direction ?? 'LR',
      categoryGap: options?.categoryGap ?? 180,
      itemGap: options?.itemGap ?? 44,
      itemHStep: options?.itemHStep ?? 20,
      categoryDistance: options?.categoryDistance ?? 200,
      getWidth: options?.getWidth ?? (() => 80),
      getHeight: options?.getHeight ?? (() => 30),
    };
  }

  async execute(data: GraphData): Promise<void> {
    this.tree = this.buildTree(data);
    if (!this.tree) return;

    const { direction, categoryGap, itemHStep, categoryDistance } = this.opts;
    const cats = this.tree.children;
    const numCats = cats.length;

    if (numCats === 0) {
      this.tree.x = 450;
      this.tree.y = 300;
      return;
    }

    // Items are evenly distributed within categoryDistance, so halfH only needs margin.
    const halfH = categoryDistance + 80;
    const centerY = halfH;

    // Spine runs from leftMargin to just before the head
    const leftMargin = categoryDistance + 20;
    const spineLength = numCats * categoryGap;

    // Head node: right of spine
    this.tree.x = leftMargin + spineLength + this.tree.width / 2;
    this.tree.y = centerY;

    for (let i = 0; i < numCats; i++) {
      const cat = cats[i];
      const dir = i % 2 === 0 ? -1 : 1; // even=above(-1), odd=below(+1)

      // Spine anchor for this category (point on horizontal spine axis)
      const spineX = leftMargin + (i + 0.5) * categoryGap;

      // Category offset LEFT so that the 45deg bone
      // connects (cat.x, cat.y) to (spineX, centerY)
      cat.x = spineX - categoryDistance;
      cat.y = centerY + dir * categoryDistance;

      // Items evenly distributed along the diagonal bone between category and spine.
      // t = (j+1)/(n+1) divides the bone into n+1 equal segments.
      // 45° geometry: x-offset = y-offset = t * categoryDistance
      const numItems = cat.children.length;
      for (let j = 0; j < numItems; j++) {
        const item = cat.children[j];
        const t = (j + 1) / (numItems + 1);
        const yOffset = t * categoryDistance;
        const meetX = cat.x + yOffset;
        item.x = meetX - itemHStep - item.width / 2;
        item.y = cat.y - dir * yOffset;
      }
    }

    if (direction === 'RL') {
      const totalW = leftMargin + spineLength + this.tree.width;
      const mirror = (n: TreeNode) => {
        n.x = totalW - n.x;
        n.children.forEach(mirror);
      };
      mirror(this.tree);
    }
  }

  forEachNode(
    fn: (n: { id: string; x: number; y: number; data?: Record<string, unknown> }) => void,
  ): void {
    if (!this.tree) return;
    const visit = (n: TreeNode) => {
      fn({ id: n.id, x: n.x, y: n.y, data: n.data });
      n.children.forEach(visit);
    };
    visit(this.tree);
  }

  private buildTree(data: GraphData): TreeNode | null {
    const nodeMap = new Map<string, TreeNode>();
    const childrenMap = new Map<string, string[]>();
    const hasParent = new Set<string>();

    for (const n of data.nodes) {
      nodeMap.set(n.id, {
        id: n.id,
        data: n.data || {},
        children: [],
        x: 0,
        y: 0,
        width: this.opts.getWidth(n as GraphNode),
        height: this.opts.getHeight(n as GraphNode),
      });
    }

    for (const e of data.edges) {
      if (!childrenMap.has(e.source)) childrenMap.set(e.source, []);
      childrenMap.get(e.source)!.push(e.target);
      hasParent.add(e.target);
    }

    let rootId: string | undefined;
    for (const n of data.nodes) {
      if (!hasParent.has(n.id)) {
        rootId = n.id;
        break;
      }
    }
    if (!rootId) return null;

    const build = (id: string): TreeNode => {
      const n = nodeMap.get(id)!;
      for (const childId of childrenMap.get(id) ?? []) {
        n.children.push(build(childId));
      }
      return n;
    };

    return build(rootId);
  }
}
