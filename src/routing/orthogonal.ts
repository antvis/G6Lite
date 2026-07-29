/**
 * Orthogonal routing: compute waypoints for polyline edges
 * that use only horizontal and vertical segments.
 */

export interface Waypoint {
  x: number;
  y: number;
}

export interface NodeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type LayoutDirection = 'TB' | 'LR' | 'BT' | 'RL';

/**
 * Compute orthogonal route between source and target nodes.
 * Returns an array of waypoints (including source port and target port).
 *
 * @param src  Source node rect (center-based)
 * @param tgt  Target node rect (center-based)
 * @param direction  Layout direction from dagre (TB = top-to-bottom, etc.)
 * @param offset  Minimum gap between nodes and the routing midline
 */
export function computeOrthogonalRoute(
  src: NodeRect,
  tgt: NodeRect,
  direction: LayoutDirection = 'TB',
  offset = 20,
): Waypoint[] {
  switch (direction) {
    case 'TB':
      return routeTB(src, tgt, offset);
    case 'BT':
      return routeTB(tgt, src, offset).reverse();
    case 'LR':
      return routeLR(src, tgt, offset);
    case 'RL':
      return routeLR(tgt, src, offset).reverse();
    default:
      return routeTB(src, tgt, offset);
  }
}

/**
 * Apply rounded corners to a waypoint list.
 * Replaces sharp 90-degree bends with arc segments.
 *
 * @param points   Original waypoints
 * @param radius   Corner radius
 * @param arcSegs  Number of arc segments per corner (default 6)
 * @returns  New waypoint list with arc approximation at corners
 */
export function applyRoundedCorners(points: Waypoint[], radius: number, arcSegs = 12): Waypoint[] {
  if (points.length < 3 || radius <= 0) return points;

  const result: Waypoint[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    // Vectors from curr to prev and curr to next
    const dx1 = prev.x - curr.x;
    const dy1 = prev.y - curr.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    if (len1 === 0 || len2 === 0) {
      result.push(curr);
      continue;
    }

    // Clamp radius so arc doesn't exceed half the segment length
    const r = Math.min(radius, len1 * 0.5, len2 * 0.5);

    // Unit vectors
    const ux1 = dx1 / len1;
    const uy1 = dy1 / len1;
    const ux2 = dx2 / len2;
    const uy2 = dy2 / len2;

    // Arc start and end points
    const arcStart = { x: curr.x + ux1 * r, y: curr.y + uy1 * r };
    const arcEnd = { x: curr.x + ux2 * r, y: curr.y + uy2 * r };

    // Determine arc center (offset from corner in the bisector direction)
    const cx = curr.x + ux1 * r + ux2 * r;
    const cy = curr.y + uy1 * r + uy2 * r;

    // Add arc start
    result.push(arcStart);

    // Interpolate arc segments using angles
    const startAngle = Math.atan2(arcStart.y - cy, arcStart.x - cx);
    const endAngle = Math.atan2(arcEnd.y - cy, arcEnd.x - cx);

    // Determine sweep direction
    let sweep = endAngle - startAngle;
    if (sweep > Math.PI) sweep -= 2 * Math.PI;
    if (sweep < -Math.PI) sweep += 2 * Math.PI;

    const arcR = Math.sqrt(
      (arcStart.x - cx) * (arcStart.x - cx) + (arcStart.y - cy) * (arcStart.y - cy),
    );

    for (let j = 1; j < arcSegs; j++) {
      const t = j / arcSegs;
      const angle = startAngle + sweep * t;
      result.push({
        x: cx + Math.cos(angle) * arcR,
        y: cy + Math.sin(angle) * arcR,
      });
    }

    result.push(arcEnd);
  }

  result.push(points[points.length - 1]);
  return result;
}

/**
 * Find the midpoint along a polyline path (by cumulative distance).
 */
export function getPolylineMidpoint(points: Waypoint[]): Waypoint {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return { ...points[0] };

  let totalLen = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    totalLen += Math.sqrt(dx * dx + dy * dy);
  }

  const halfLen = totalLen / 2;
  let accum = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const segLen = Math.sqrt(dx * dx + dy * dy);
    if (accum + segLen >= halfLen) {
      const t = segLen > 0 ? (halfLen - accum) / segLen : 0;
      return {
        x: points[i - 1].x + dx * t,
        y: points[i - 1].y + dy * t,
      };
    }
    accum += segLen;
  }

  return { ...points[points.length - 1] };
}

/**
 * Tree routing: for edges sharing the same parent, create shared-trunk style routes.
 * Supports 'orth' (right-angle) and 'cubic' (smooth S-curve) modes.
 *
 * Cubic mode generates a cubic bezier S-curve tessellated into segments:
 *   P0 = parent bottom center
 *   CP1 = (parentX, midY)
 *   CP2 = (childX, midY)
 *   P3 = child top center
 *
 * Returns a Map from edge index to waypoint arrays.
 */
export function computeTreeRoutes(
  edges: Array<{ index: number; src: NodeRect; tgt: NodeRect }>,
  direction: LayoutDirection = 'TB',
  mode: 'orth' | 'cubic' = 'orth',
  curveSegments = 20,
): Map<number, Waypoint[]> {
  const result = new Map<number, Waypoint[]>();

  // Group edges by source node position
  const groups = new Map<string, Array<{ index: number; src: NodeRect; tgt: NodeRect }>>();
  for (const edge of edges) {
    const key = `${edge.src.x},${edge.src.y}`;
    let group = groups.get(key);
    if (!group) {
      group = [];
      groups.set(key, group);
    }
    group.push(edge);
  }

  // Pre-compute incoming edge count and index per target node for port distribution
  const incomingCount = new Map<string, number>(); // tgt key → total incoming edges
  const incomingIndex = new Map<number, number>(); // edge index → which incoming index it is
  for (const edge of edges) {
    const tgtKey = `${edge.tgt.x},${edge.tgt.y}`;
    const count = incomingCount.get(tgtKey) ?? 0;
    incomingIndex.set(edge.index, count);
    incomingCount.set(tgtKey, count + 1);
  }

  for (const group of groups.values()) {
    if (group.length === 0) continue;

    const src = group[0].src;

    if (direction === 'TB' || direction === 'BT') {
      const srcBottom = src.y + src.height / 2;

      // Find closest child to determine fork point
      let closestChildTop = Infinity;
      for (const e of group) {
        const childTop = e.tgt.y - e.tgt.height / 2;
        if (childTop < closestChildTop) closestChildTop = childTop;
      }
      // Fork point: 30% of the gap below parent
      const forkY = srcBottom + (closestChildTop - srcBottom) * 0.3;

      // Sort children by X to assign port positions
      const sorted = [...group].sort((a, b) => a.tgt.x - b.tgt.x);
      const n = sorted.length;
      // Distribute exit ports evenly along parent bottom edge
      const portSpacing = src.width * 0.6; // use 60% of node width for ports
      const portStartX = src.x - portSpacing / 2;

      for (let ei = 0; ei < sorted.length; ei++) {
        const edge = sorted[ei];
        const tgtTop = edge.tgt.y - edge.tgt.height / 2;
        // Source port: evenly distributed along parent bottom
        const portX = n === 1 ? src.x : portStartX + (portSpacing * ei) / (n - 1);

        // Target port: evenly distributed along child top
        const tgtKey = `${edge.tgt.x},${edge.tgt.y}`;
        const tgtTotal = incomingCount.get(tgtKey) ?? 1;
        const tgtIdx = incomingIndex.get(edge.index) ?? 0;
        const tgtPortSpacing = edge.tgt.width * 0.6;
        const tgtPortStartX = edge.tgt.x - tgtPortSpacing / 2;
        const tgtPortX =
          tgtTotal === 1 ? edge.tgt.x : tgtPortStartX + (tgtPortSpacing * tgtIdx) / (tgtTotal - 1);

        if (mode === 'cubic') {
          const p0 = { x: portX, y: srcBottom };
          const midCurveY = forkY + (tgtTop - forkY) * 0.5;
          const cp1 = { x: portX, y: midCurveY };
          const cp2 = { x: tgtPortX, y: midCurveY };
          const p3 = { x: tgtPortX, y: tgtTop };
          result.set(edge.index, tessellateCubicBezier(p0, cp1, cp2, p3, curveSegments));
        } else {
          // Orthogonal
          if (n === 1 && Math.abs(portX - tgtPortX) < 0.5) {
            result.set(edge.index, [
              { x: portX, y: srcBottom },
              { x: tgtPortX, y: tgtTop },
            ]);
          } else {
            result.set(edge.index, [
              { x: portX, y: srcBottom },
              { x: portX, y: forkY },
              { x: tgtPortX, y: forkY },
              { x: tgtPortX, y: tgtTop },
            ]);
          }
        }
      }
    } else {
      // LR/RL
      const srcRight = src.x + src.width / 2;

      let closestChildLeft = Infinity;
      for (const e of group) {
        const childLeft = e.tgt.x - e.tgt.width / 2;
        if (childLeft < closestChildLeft) closestChildLeft = childLeft;
      }
      const forkX = srcRight + (closestChildLeft - srcRight) * 0.3;

      for (const edge of group) {
        const tgtLeft = edge.tgt.x - edge.tgt.width / 2;

        if (mode === 'cubic') {
          const trunkEnd = { x: forkX, y: src.y };
          const cp1 = { x: forkX + (tgtLeft - forkX) * 0.3, y: src.y };
          const cp2 = { x: forkX + (tgtLeft - forkX) * 0.7, y: edge.tgt.y };
          const p3 = { x: tgtLeft, y: edge.tgt.y };
          const curvePoints = tessellateCubicBezier(trunkEnd, cp1, cp2, p3, curveSegments);
          result.set(edge.index, [{ x: srcRight, y: src.y }, ...curvePoints]);
        } else {
          if (group.length === 1 && Math.abs(src.y - edge.tgt.y) < 0.5) {
            result.set(edge.index, [
              { x: srcRight, y: src.y },
              { x: tgtLeft, y: edge.tgt.y },
            ]);
          } else {
            result.set(edge.index, [
              { x: srcRight, y: src.y },
              { x: forkX, y: src.y },
              { x: forkX, y: edge.tgt.y },
              { x: tgtLeft, y: edge.tgt.y },
            ]);
          }
        }
      }
    }
  }

  return result;
}

/** Tessellate a cubic bezier curve into N line segments. */
function tessellateCubicBezier(
  p0: Waypoint,
  cp1: Waypoint,
  cp2: Waypoint,
  p3: Waypoint,
  segments: number,
): Waypoint[] {
  const points: Waypoint[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    points.push({
      x: mt3 * p0.x + 3 * mt2 * t * cp1.x + 3 * mt * t2 * cp2.x + t3 * p3.x,
      y: mt3 * p0.y + 3 * mt2 * t * cp1.y + 3 * mt * t2 * cp2.y + t3 * p3.y,
    });
  }
  return points;
}

/**
 * Indented tree routing: vertical trunk from parent bottom, horizontal branch to each child.
 * Produces L-shaped right-angle edges for indented tree layouts.
 *
 * For LR direction:
 *   (parentX, parentBottom) → (parentX, childY) → (childLeft, childY)
 */
export function computeIndentedRoutes(
  edges: Array<{ index: number; src: NodeRect; tgt: NodeRect }>,
  direction: LayoutDirection = 'LR',
  targetEnd: 'left' | 'right' = 'left',
  _trunkGap: number = 0,
): Map<number, Waypoint[]> {
  const result = new Map<number, Waypoint[]>();

  for (const edge of edges) {
    const { src, tgt } = edge;

    if (direction === 'LR' || direction === 'RL') {
      if (targetEnd === 'right') {
        // No-background mode: trunk from parent center, edge to child text right edge.
        // Text starts at tgt.x, spans tgt.width, so right edge = tgt.x + tgt.width.
        const trunkX = src.x;

        result.set(edge.index, [
          { x: trunkX, y: src.y },
          { x: trunkX, y: tgt.y },
          { x: tgt.x + (direction === 'LR' ? tgt.width : -tgt.width), y: tgt.y },
        ]);
      } else {
        // Original behavior: trunk from parent center bottom, edge to child left edge
        const trunkX = src.x;
        const srcBottom = src.y + src.height / 2;
        const tgtLeft = direction === 'LR' ? tgt.x - tgt.width / 2 : tgt.x + tgt.width / 2;

        result.set(edge.index, [
          { x: trunkX, y: srcBottom },
          { x: trunkX, y: tgt.y },
          { x: tgtLeft, y: tgt.y },
        ]);
      }
    } else {
      // TB/BT: trunk goes horizontally from parent right, then vertical to child
      const trunkY = src.y;
      const srcRight = src.x + src.width / 2;
      const tgtTop = direction === 'TB' ? tgt.y - tgt.height / 2 : tgt.y + tgt.height / 2;

      result.set(edge.index, [
        { x: srcRight, y: trunkY },
        { x: tgt.x, y: trunkY },
        { x: tgt.x, y: tgtTop },
      ]);
    }
  }

  return result;
}

// --- Internal routing helpers ---

function routeTB(src: NodeRect, tgt: NodeRect, offset: number): Waypoint[] {
  const srcBottom = src.y + src.height / 2;
  const tgtTop = tgt.y - tgt.height / 2;

  const p0 = { x: src.x, y: srcBottom };
  const pN = { x: tgt.x, y: tgtTop };

  // Normal case: source above target with space between
  if (srcBottom < tgtTop - offset) {
    const midY = (srcBottom + tgtTop) / 2;

    if (Math.abs(src.x - tgt.x) < 0.5) {
      // Straight vertical line
      return [p0, pN];
    }
    return [p0, { x: src.x, y: midY }, { x: tgt.x, y: midY }, pN];
  }

  // Edge case: nodes are too close vertically or reversed — route around
  const srcRight = src.x + src.width / 2;
  const tgtRight = tgt.x + tgt.width / 2;

  // Route to the side with more space
  const sideX = Math.max(srcRight, tgtRight) + offset;
  const exitY = srcBottom + offset;
  const entryY = tgtTop - offset;

  return [
    p0,
    { x: src.x, y: exitY },
    { x: sideX, y: exitY },
    { x: sideX, y: entryY },
    { x: tgt.x, y: entryY },
    pN,
  ];
}

/**
 * Fishbone diagram edge routing (LR: head on right, spine horizontal).
 *
 * Two edge types are distinguished geometrically:
 *   head→category: src (head) is to the right of the computed spine anchor.
 *     Route: head-left-edge → spine-anchor → category-center
 *     The spine anchor x = cat.x + |cat.y - head.y|  (45° geometry)
 *   category→item: src (cat) is NOT to the right of the computed spine anchor.
 *     Route: cat-left-edge → item-center  (short diagonal)
 */
export function computeFishboneRoute(
  src: NodeRect,
  tgt: NodeRect,
  _direction: LayoutDirection = 'LR',
): Waypoint[] {
  const dy = Math.abs(src.y - tgt.y);
  const srcLeft = src.x - src.width / 2;

  // Spine anchor for a potential head→cat edge
  // (assumes 45° bone: horizontal offset = vertical offset = dy)
  const spineAnchorX = tgt.x + dy;

  if (dy < 2) {
    // Same vertical level → straight horizontal line
    return [
      { x: srcLeft, y: src.y },
      { x: tgt.x, y: tgt.y },
    ];
  }

  if (src.x > spineAnchorX) {
    // head→category: route via spine anchor (horizontal spine + 45° diagonal)
    return [
      { x: srcLeft, y: src.y },
      { x: spineAnchorX, y: src.y },
      { x: tgt.x, y: tgt.y },
    ];
  }

  // category→item: horizontal branch from the 45° diagonal bone to the item.
  // meetX = src.x + dy  (point on diagonal where this item branches off)
  // Route starts at meetX (on the bone), goes horizontal left to item right edge.
  const meetX = src.x + dy;
  return [
    { x: meetX, y: tgt.y },
    { x: tgt.x + tgt.width / 2, y: tgt.y },
  ];
}

function routeLR(src: NodeRect, tgt: NodeRect, offset: number): Waypoint[] {
  const srcRight = src.x + src.width / 2;
  const tgtLeft = tgt.x - tgt.width / 2;

  const p0 = { x: srcRight, y: src.y };
  const pN = { x: tgtLeft, y: tgt.y };

  if (srcRight < tgtLeft - offset) {
    const midX = (srcRight + tgtLeft) / 2;

    if (Math.abs(src.y - tgt.y) < 0.5) {
      return [p0, pN];
    }
    return [p0, { x: midX, y: src.y }, { x: midX, y: tgt.y }, pN];
  }

  const sideY = Math.max(src.y + src.height / 2, tgt.y + tgt.height / 2) + offset;
  const exitX = srcRight + offset;
  const entryX = tgtLeft - offset;

  return [
    p0,
    { x: exitX, y: src.y },
    { x: exitX, y: sideY },
    { x: entryX, y: sideY },
    { x: entryX, y: tgt.y },
    pN,
  ];
}
