/**
 * EdgeArc: renders a quadratic bezier as one triangle strip per edge.
 * Degenerate vertices isolate adjacent edge strips inside a single draw call.
 * Adjacent curve samples reuse the analytic normal, avoiding cracks at joins.
 *
 * Stride: 13 floats per vertex (position.xy, normalSide.xyz,
 * style[lineWidth,dashCycle,pathDistance,opacity], color.rgb, pickingIndex).
 * pathDistance is accumulated in graph coordinates and converted to pixels in
 * the vertex shader so dash phase remains continuous across every segment.
 * Twenty-four segments keep long, highly curved edges visually smooth while
 * retaining a fixed per-edge allocation and zoom-independent geometry.
 */

import type { AttributeLayout, RenderParams } from './program.js';
import { Program } from './program.js';
import { fragmentShader } from './shaders/edgeArc.frag.js';
import { vertexShader } from './shaders/edgeArc.vert.js';

const FLOATS_PER_VERTEX = 13;
const SEGMENTS = 24;
const VERTICES_PER_ITEM = (SEGMENTS + 1) * 2 + 2;

function writeVertex(
  array: Float32Array,
  offset: number,
  x: number,
  y: number,
  normalX: number,
  normalY: number,
  normalCoef: number,
  lineWidth: number,
  dashCycle: number,
  pathDistance: number,
  opacity: number,
  color: [number, number, number],
  pickingIndex: number,
): void {
  array[offset] = x;
  array[offset + 1] = y;
  array[offset + 2] = normalX;
  array[offset + 3] = normalY;
  array[offset + 4] = normalCoef;
  array[offset + 5] = lineWidth;
  array[offset + 6] = dashCycle;
  array[offset + 7] = pathDistance;
  array[offset + 8] = opacity;
  array[offset + 9] = color[0];
  array[offset + 10] = color[1];
  array[offset + 11] = color[2];
  array[offset + 12] = pickingIndex;
}

export class EdgeArcProgram extends Program {
  getVertexShader() {
    return vertexShader;
  }
  getFragmentShader() {
    return fragmentShader;
  }
  getFloatsPerVertex() {
    return FLOATS_PER_VERTEX;
  }
  getVerticesPerItem() {
    return VERTICES_PER_ITEM;
  }
  getDrawMethod() {
    return this.gl.TRIANGLE_STRIP;
  }

  getAttributeLayout(): AttributeLayout[] {
    return [
      { name: 'a_position', size: 2 },
      { name: 'a_normalSide', size: 3 },
      { name: 'a_style', size: 4 },
      { name: 'a_color', size: 3 },
      { name: 'a_pickingIndex', size: 1 },
    ];
  }

  setUniforms(params: RenderParams): void {
    const gl = this.gl;
    gl.uniform2f(this.uniform('u_translate'), params.camera.x, params.camera.y);
    gl.uniform1f(this.uniform('u_scale'), params.camera.zoom);
    gl.uniform2f(this.uniform('u_resolution'), params.width, params.height);
  }

  processEdge(
    index: number,
    sx: number,
    sy: number,
    tx: number,
    ty: number,
    color: [number, number, number],
    pickingIndex: number,
    curvature: number,
    lineWidth: number = 1,
    dashCycle: number = 0,
    opacity: number = 1,
  ): void {
    // Quadratic bezier control point: perpendicular offset from midpoint.
    const mx = (sx + tx) * 0.5;
    const my = (sy + ty) * 0.5;
    const dx = tx - sx;
    const dy = ty - sy;
    const cpx = mx - dy * curvature;
    const cpy = my + dx * curvature;

    const base = index * VERTICES_PER_ITEM * FLOATS_PER_VERTEX;
    let x0 = sx;
    let y0 = sy;
    let pathDistance0 = 0;

    // The factor 2 in the quadratic derivative cancels during normalization.
    let tangentX0 = cpx - sx;
    let tangentY0 = cpy - sy;
    let tangentLength0 = Math.hypot(tangentX0, tangentY0);
    if (tangentLength0 < 1e-8) {
      tangentX0 = dx;
      tangentY0 = dy;
      tangentLength0 = Math.hypot(tangentX0, tangentY0);
    }
    let normalX0 = tangentLength0 > 1e-8 ? -tangentY0 / tangentLength0 : 0;
    let normalY0 = tangentLength0 > 1e-8 ? tangentX0 / tangentLength0 : 1;

    let vertex = 0;

    // Duplicate the first left vertex so this edge starts with a degenerate
    // triangle and does not connect to the previous edge's strip.
    writeVertex(
      this.array,
      base + vertex++ * FLOATS_PER_VERTEX,
      x0,
      y0,
      normalX0,
      normalY0,
      -1,
      lineWidth,
      dashCycle,
      pathDistance0,
      opacity,
      color,
      pickingIndex,
    );
    writeVertex(
      this.array,
      base + vertex++ * FLOATS_PER_VERTEX,
      x0,
      y0,
      normalX0,
      normalY0,
      -1,
      lineWidth,
      dashCycle,
      pathDistance0,
      opacity,
      color,
      pickingIndex,
    );
    writeVertex(
      this.array,
      base + vertex++ * FLOATS_PER_VERTEX,
      x0,
      y0,
      normalX0,
      normalY0,
      1,
      lineWidth,
      dashCycle,
      pathDistance0,
      opacity,
      color,
      pickingIndex,
    );

    for (let segment = 0; segment < SEGMENTS; segment++) {
      const t1 = (segment + 1) / SEGMENTS;
      const x1 = bezier(sx, cpx, tx, t1);
      const y1 = bezier(sy, cpy, ty, t1);
      const segmentDx = x1 - x0;
      const segmentDy = y1 - y0;
      const pathDistance1 = pathDistance0 + Math.hypot(segmentDx, segmentDy);

      let tangentX1 = (1 - t1) * (cpx - sx) + t1 * (tx - cpx);
      let tangentY1 = (1 - t1) * (cpy - sy) + t1 * (ty - cpy);
      let tangentLength1 = Math.hypot(tangentX1, tangentY1);
      if (tangentLength1 < 1e-8) {
        tangentX1 = segmentDx;
        tangentY1 = segmentDy;
        tangentLength1 = Math.hypot(tangentX1, tangentY1);
      }
      const normalX1 = tangentLength1 > 1e-8 ? -tangentY1 / tangentLength1 : normalX0;
      const normalY1 = tangentLength1 > 1e-8 ? tangentX1 / tangentLength1 : normalY0;

      writeVertex(
        this.array,
        base + vertex++ * FLOATS_PER_VERTEX,
        x1,
        y1,
        normalX1,
        normalY1,
        -1,
        lineWidth,
        dashCycle,
        pathDistance1,
        opacity,
        color,
        pickingIndex,
      );
      writeVertex(
        this.array,
        base + vertex++ * FLOATS_PER_VERTEX,
        x1,
        y1,
        normalX1,
        normalY1,
        1,
        lineWidth,
        dashCycle,
        pathDistance1,
        opacity,
        color,
        pickingIndex,
      );

      x0 = x1;
      y0 = y1;
      normalX0 = normalX1;
      normalY0 = normalY1;
      pathDistance0 = pathDistance1;
    }

    // Duplicate the last right vertex so the bridge to the next edge is also
    // degenerate. The fixed item size lets Program draw every edge in one call.
    writeVertex(
      this.array,
      base + vertex * FLOATS_PER_VERTEX,
      x0,
      y0,
      normalX0,
      normalY0,
      1,
      lineWidth,
      dashCycle,
      pathDistance0,
      opacity,
      color,
      pickingIndex,
    );
  }
}

/** Quadratic bezier: (1-t)^2 * a + 2(1-t)t * cp + t^2 * b */
function bezier(a: number, cp: number, b: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * a + 2 * mt * t * cp + t * t * b;
}
