/**
 * NodeCircleQuad: renders circle nodes as 2 triangles (6 vertices).
 * Unlike GL_POINTS, the quad is not limited by ALIASED_POINT_SIZE_RANGE.
 * Supports fill, stroke, opacity, halo, and picking.
 * Stride: 17 floats per vertex.
 */

import { encodeId } from '../picking';
import type { AttributeLayout } from './program';
import { Program } from './program';
import { fragmentShader } from './shaders/nodeCircleQuad.frag';
import { vertexShader } from './shaders/nodeCircleQuad.vert';

const FLOATS_PER_VERTEX = 17;
const VERTICES_PER_ITEM = 6;

const CORNERS: [number, number][] = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
  [-1, 1],
];

export class NodeCircleQuadProgram extends Program {
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
    return 'triangles' as const;
  }

  getAttributeLayout(): AttributeLayout[] {
    return [
      { name: 'a_center', size: 2 },
      { name: 'a_size', size: 1 },
      { name: 'a_corner', size: 2 },
      { name: 'a_color', size: 3 },
      { name: 'a_pickingColor', size: 3 },
      { name: 'a_strokeWidth', size: 1 },
      { name: 'a_strokeColor', size: 3 },
      { name: 'a_opacity', size: 1 },
      { name: 'a_haloWidth', size: 1 },
    ];
  }

  processNode(
    index: number,
    x: number,
    y: number,
    size: number,
    color: [number, number, number],
    pickingIndex: number,
    strokeWidth: number = 0,
    strokeColor: [number, number, number] = [1, 1, 1],
    opacity: number = 1,
    haloWidth: number = 0,
  ): void {
    const [pr, pg, pb] = encodeId(pickingIndex);
    const pickingColor: [number, number, number] = [pr / 255, pg / 255, pb / 255];
    const base = index * VERTICES_PER_ITEM * FLOATS_PER_VERTEX;

    this.writeVertex(
      base,
      x,
      y,
      size,
      CORNERS[0],
      color,
      pickingColor,
      strokeWidth,
      strokeColor,
      opacity,
      haloWidth,
    );

    // All attributes except a_corner are shared by the six vertices.
    for (let v = 1; v < VERTICES_PER_ITEM; v++) {
      const offset = base + v * FLOATS_PER_VERTEX;
      this.array.copyWithin(offset, base, base + FLOATS_PER_VERTEX);
      this.array[offset + 3] = CORNERS[v][0];
      this.array[offset + 4] = CORNERS[v][1];
    }
  }

  /**
   * Fast path for static config: copies a pre-built six-vertex template then
   * writes only center and picking color for each vertex.
   */
  processNodeStatic(
    index: number,
    x: number,
    y: number,
    pickingIndex: number,
    template: Float32Array,
  ): void {
    const base = index * VERTICES_PER_ITEM * FLOATS_PER_VERTEX;
    this.array.set(template, base);

    const [pr, pg, pb] = encodeId(pickingIndex);
    const pR = pr / 255;
    const pG = pg / 255;
    const pB = pb / 255;

    for (let v = 0; v < VERTICES_PER_ITEM; v++) {
      const offset = base + v * FLOATS_PER_VERTEX;
      this.array[offset] = x;
      this.array[offset + 1] = y;
      this.array[offset + 8] = pR;
      this.array[offset + 9] = pG;
      this.array[offset + 10] = pB;
    }
  }

  /** Build a six-vertex template for processNodeStatic(). */
  static buildTemplate(
    size: number,
    color: [number, number, number],
    strokeWidth: number,
    strokeColor: [number, number, number],
    opacity: number,
    haloWidth: number,
  ): Float32Array {
    const template = new Float32Array(VERTICES_PER_ITEM * FLOATS_PER_VERTEX);

    for (let v = 0; v < VERTICES_PER_ITEM; v++) {
      const offset = v * FLOATS_PER_VERTEX;
      template[offset + 2] = size;
      template[offset + 3] = CORNERS[v][0];
      template[offset + 4] = CORNERS[v][1];
      template[offset + 5] = color[0];
      template[offset + 6] = color[1];
      template[offset + 7] = color[2];
      template[offset + 11] = strokeWidth;
      template[offset + 12] = strokeColor[0];
      template[offset + 13] = strokeColor[1];
      template[offset + 14] = strokeColor[2];
      template[offset + 15] = opacity;
      template[offset + 16] = haloWidth;
    }

    return template;
  }

  /** Return the full rendered diameter (node size + halo on both sides) in graph coords. */
  getNodeExtent(index: number): number {
    const offset = index * VERTICES_PER_ITEM * FLOATS_PER_VERTEX;
    return this.array[offset + 2] + this.array[offset + 16] * 2;
  }

  getNodeSize(index: number): number {
    return this.array[index * VERTICES_PER_ITEM * FLOATS_PER_VERTEX + 2];
  }

  getNodeHaloWidth(index: number): number {
    return this.array[index * VERTICES_PER_ITEM * FLOATS_PER_VERTEX + 16];
  }

  /** Patch style attributes for a single circle without full reprocess. */
  patchNodeStyle(
    index: number,
    patch: {
      color?: [number, number, number];
      size?: number;
      strokeWidth?: number;
      strokeColor?: [number, number, number];
      opacity?: number;
      haloWidth?: number;
    },
  ): void {
    if (patch.color) this.patchAttribute(index, 'a_color', patch.color);
    if (patch.size !== undefined) this.patchAttribute(index, 'a_size', [patch.size]);
    if (patch.strokeWidth !== undefined) {
      this.patchAttribute(index, 'a_strokeWidth', [patch.strokeWidth]);
    }
    if (patch.strokeColor) this.patchAttribute(index, 'a_strokeColor', patch.strokeColor);
    if (patch.opacity !== undefined) this.patchAttribute(index, 'a_opacity', [patch.opacity]);
    if (patch.haloWidth !== undefined) this.patchAttribute(index, 'a_haloWidth', [patch.haloWidth]);
  }

  private writeVertex(
    offset: number,
    x: number,
    y: number,
    size: number,
    corner: [number, number],
    color: [number, number, number],
    pickingColor: [number, number, number],
    strokeWidth: number,
    strokeColor: [number, number, number],
    opacity: number,
    haloWidth: number,
  ): void {
    this.array[offset] = x;
    this.array[offset + 1] = y;
    this.array[offset + 2] = size;
    this.array[offset + 3] = corner[0];
    this.array[offset + 4] = corner[1];
    this.array[offset + 5] = color[0];
    this.array[offset + 6] = color[1];
    this.array[offset + 7] = color[2];
    this.array[offset + 8] = pickingColor[0];
    this.array[offset + 9] = pickingColor[1];
    this.array[offset + 10] = pickingColor[2];
    this.array[offset + 11] = strokeWidth;
    this.array[offset + 12] = strokeColor[0];
    this.array[offset + 13] = strokeColor[1];
    this.array[offset + 14] = strokeColor[2];
    this.array[offset + 15] = opacity;
    this.array[offset + 16] = haloWidth;
  }
}
