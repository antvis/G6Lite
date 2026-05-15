/**
 * EdgeLoop: renders self-loop edges as cubic bezier arcs around the node.
 * Reuses EdgeArc's vertex layout (8 floats/vertex) and shaders.
 * Each loop: SEGMENTS line segments → SEGMENTS*2 vertices.
 */

import { Program } from './program.js';
import type { RenderParams, AttributeLayout } from './program.js';
import { vertexShader } from './shaders/edgeArc.vert.js';
import { fragmentShader } from './shaders/edgeArc.frag.js';
import { encodeId } from '../picking.js';

const FLOATS_PER_VERTEX = 8;
const SEGMENTS = 12;
const VERTICES_PER_ITEM = SEGMENTS * 2;

/** Cubic bezier: (1-t)^3*p0 + 3(1-t)^2*t*p1 + 3(1-t)*t^2*p2 + t^3*p3 */
function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

export class EdgeLoopProgram extends Program {
  getVertexShader() { return vertexShader; }
  getFragmentShader() { return fragmentShader; }
  getFloatsPerVertex() { return FLOATS_PER_VERTEX; }
  getVerticesPerItem() { return VERTICES_PER_ITEM; }
  getDrawMethod() { return this.gl.LINES; }

  getAttributeLayout(): AttributeLayout[] {
    return [
      { name: 'a_position', size: 2 },
      { name: 'a_color', size: 3 },
      { name: 'a_pickingColor', size: 3 },
    ];
  }

  setUniforms(params: RenderParams): void {
    const gl = this.gl;
    gl.uniform2f(this.uniform('u_translate'), params.camera.x, params.camera.y);
    gl.uniform1f(this.uniform('u_scale'), params.camera.zoom);
    gl.uniform2f(this.uniform('u_resolution'), params.width, params.height);
  }

  /**
   * Render a self-loop arc around a node.
   * @param index   Item index in buffer
   * @param nx, ny  Node center (graph coords)
   * @param radius  Node radius (graph coords)
   * @param angle   Direction angle in radians (where the loop points outward)
   * @param loopSize  How far the loop extends beyond the node edge (graph coords)
   * @param color   RGB [0-1]
   * @param pickingIndex  For hit detection
   */
  processLoop(
    index: number,
    nx: number, ny: number,
    radius: number,
    angle: number,
    loopSize: number,
    color: [number, number, number],
    pickingIndex: number,
  ): void {
    const [pr, pg, pb] = encodeId(pickingIndex);
    const pR = pr / 255, pG = pg / 255, pB = pb / 255;

    // Start/end points on node edge, spread ~60° apart centered on angle
    const spread = 0.5; // radians (~30° each side)
    const startAngle = angle - spread;
    const endAngle = angle + spread;

    // Start and end on node circumference
    const p0x = nx + radius * Math.cos(startAngle);
    const p0y = ny + radius * Math.sin(startAngle);
    const p3x = nx + radius * Math.cos(endAngle);
    const p3y = ny + radius * Math.sin(endAngle);

    // Control points: extend outward from node
    const ext = radius + loopSize;
    const p1x = nx + ext * Math.cos(startAngle);
    const p1y = ny + ext * Math.sin(startAngle);
    const p2x = nx + ext * Math.cos(endAngle);
    const p2y = ny + ext * Math.sin(endAngle);

    const base = index * VERTICES_PER_ITEM * FLOATS_PER_VERTEX;

    for (let i = 0; i < SEGMENTS; i++) {
      const t0 = i / SEGMENTS;
      const t1 = (i + 1) / SEGMENTS;

      const x0 = cubicBezier(p0x, p1x, p2x, p3x, t0);
      const y0 = cubicBezier(p0y, p1y, p2y, p3y, t0);
      const x1 = cubicBezier(p0x, p1x, p2x, p3x, t1);
      const y1 = cubicBezier(p0y, p1y, p2y, p3y, t1);

      const o = base + i * 2 * FLOATS_PER_VERTEX;
      // Start vertex
      this.array[o] = x0;
      this.array[o + 1] = y0;
      this.array[o + 2] = color[0];
      this.array[o + 3] = color[1];
      this.array[o + 4] = color[2];
      this.array[o + 5] = pR;
      this.array[o + 6] = pG;
      this.array[o + 7] = pB;
      // End vertex
      this.array[o + 8] = x1;
      this.array[o + 9] = y1;
      this.array[o + 10] = color[0];
      this.array[o + 11] = color[1];
      this.array[o + 12] = color[2];
      this.array[o + 13] = pR;
      this.array[o + 14] = pG;
      this.array[o + 15] = pB;
    }
  }
}
