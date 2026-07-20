/**
 * EdgeLoop: renders self-loop cubic beziers as continuous thick triangle strips.
 * Degenerate vertices isolate adjacent loops inside a single draw call.
 */

import type { AttributeLayout, RenderParams } from './program.js';
import { Program } from './program.js';
import { fragmentShader } from './shaders/edgeArc.frag.js';
import { vertexShader } from './shaders/edgeArc.vert.js';

const FLOATS_PER_VERTEX = 13;
const SEGMENTS = 24;
const VERTICES_PER_ITEM = (SEGMENTS + 1) * 2 + 2;

function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

function cubicTangent(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t;
  return 3 * mt * mt * (p1 - p0) + 6 * mt * t * (p2 - p1) + 3 * t * t * (p3 - p2);
}

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

export class EdgeLoopProgram extends Program {
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

  processLoop(
    index: number,
    nx: number,
    ny: number,
    radius: number,
    angle: number,
    loopSize: number,
    color: [number, number, number],
    pickingIndex: number,
    lineWidth = 1,
    dashCycle = 0,
    opacity = 1,
  ): void {
    const spread = 0.5;
    const startAngle = angle - spread;
    const endAngle = angle + spread;
    const p0x = nx + radius * Math.cos(startAngle);
    const p0y = ny + radius * Math.sin(startAngle);
    const p3x = nx + radius * Math.cos(endAngle);
    const p3y = ny + radius * Math.sin(endAngle);
    const ext = radius + loopSize;
    const p1x = nx + ext * Math.cos(startAngle);
    const p1y = ny + ext * Math.sin(startAngle);
    const p2x = nx + ext * Math.cos(endAngle);
    const p2y = ny + ext * Math.sin(endAngle);

    const base = index * VERTICES_PER_ITEM * FLOATS_PER_VERTEX;
    let x0 = p0x;
    let y0 = p0y;
    let pathDistance = 0;
    let tangentX = cubicTangent(p0x, p1x, p2x, p3x, 0);
    let tangentY = cubicTangent(p0y, p1y, p2y, p3y, 0);
    let tangentLength = Math.hypot(tangentX, tangentY);
    if (tangentLength < 1e-8) {
      tangentX = p3x - p0x;
      tangentY = p3y - p0y;
      tangentLength = Math.hypot(tangentX, tangentY);
    }
    let normalX = tangentLength > 1e-8 ? -tangentY / tangentLength : 0;
    let normalY = tangentLength > 1e-8 ? tangentX / tangentLength : 1;
    let vertex = 0;

    // Duplicate the first left vertex so the strip cannot connect to the
    // preceding loop item.
    for (let duplicate = 0; duplicate < 2; duplicate++) {
      writeVertex(
        this.array,
        base + vertex++ * FLOATS_PER_VERTEX,
        x0,
        y0,
        normalX,
        normalY,
        -1,
        lineWidth,
        dashCycle,
        pathDistance,
        opacity,
        color,
        pickingIndex,
      );
    }
    writeVertex(
      this.array,
      base + vertex++ * FLOATS_PER_VERTEX,
      x0,
      y0,
      normalX,
      normalY,
      1,
      lineWidth,
      dashCycle,
      pathDistance,
      opacity,
      color,
      pickingIndex,
    );

    for (let segment = 0; segment < SEGMENTS; segment++) {
      const t = (segment + 1) / SEGMENTS;
      const x = cubicBezier(p0x, p1x, p2x, p3x, t);
      const y = cubicBezier(p0y, p1y, p2y, p3y, t);
      const segmentX = x - x0;
      const segmentY = y - y0;
      pathDistance += Math.hypot(segmentX, segmentY);

      tangentX = cubicTangent(p0x, p1x, p2x, p3x, t);
      tangentY = cubicTangent(p0y, p1y, p2y, p3y, t);
      tangentLength = Math.hypot(tangentX, tangentY);
      if (tangentLength < 1e-8) {
        tangentX = segmentX;
        tangentY = segmentY;
        tangentLength = Math.hypot(tangentX, tangentY);
      }
      if (tangentLength >= 1e-8) {
        normalX = -tangentY / tangentLength;
        normalY = tangentX / tangentLength;
      }

      for (const side of [-1, 1]) {
        writeVertex(
          this.array,
          base + vertex++ * FLOATS_PER_VERTEX,
          x,
          y,
          normalX,
          normalY,
          side,
          lineWidth,
          dashCycle,
          pathDistance,
          opacity,
          color,
          pickingIndex,
        );
      }
      x0 = x;
      y0 = y;
    }

    // Duplicate the last right vertex to make the bridge to the next loop
    // degenerate as well.
    writeVertex(
      this.array,
      base + vertex * FLOATS_PER_VERTEX,
      x0,
      y0,
      normalX,
      normalY,
      1,
      lineWidth,
      dashCycle,
      pathDistance,
      opacity,
      color,
      pickingIndex,
    );
  }
}
