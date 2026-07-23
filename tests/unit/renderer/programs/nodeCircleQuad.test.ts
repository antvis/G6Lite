import { describe, expect, it } from 'vitest';
import { encodeId } from '@src/renderer/picking.js';
import { NodeCircleQuadProgram } from '@src/renderer/programs/nodeCircleQuad.js';

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

/** Minimal WebGL stub for constructing and inspecting the CPU-side buffer. */
function makeGLStub(): WebGLRenderingContext {
  const overrides: Record<string, unknown> = {
    TRIANGLES: 4,
    getShaderParameter: () => true,
    getProgramParameter: () => true,
    getShaderInfoLog: () => '',
    getProgramInfoLog: () => '',
    getUniformLocation: () => ({}),
    getAttribLocation: () => 0,
    getExtension: () => null,
    createShader: () => ({}),
    createProgram: () => ({}),
    createBuffer: () => ({}),
  };
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, property: string) {
      if (property in overrides) return overrides[property];
      if (/^[A-Z0-9_]+$/.test(property)) return 1;
      return () => undefined;
    },
  };
  return new Proxy({}, handler) as unknown as WebGLRenderingContext;
}

function usedBuffer(program: NodeCircleQuadProgram, itemCount = 1): Float32Array {
  return program.getArray().slice(0, itemCount * VERTICES_PER_ITEM * FLOATS_PER_VERTEX);
}

describe('NodeCircleQuadProgram buffer encoding', () => {
  it('declares the 17-float triangle-quad attribute layout', () => {
    const program = new NodeCircleQuadProgram(makeGLStub());

    expect(program.getFloatsPerVertex()).toBe(FLOATS_PER_VERTEX);
    expect(program.getVerticesPerItem()).toBe(VERTICES_PER_ITEM);
    expect(program.getDrawMethod()).toBe(4);
    expect(program.getAttributeLayout()).toEqual([
      { name: 'a_center', size: 2 },
      { name: 'a_size', size: 1 },
      { name: 'a_corner', size: 2 },
      { name: 'a_color', size: 3 },
      { name: 'a_pickingColor', size: 3 },
      { name: 'a_strokeWidth', size: 1 },
      { name: 'a_strokeColor', size: 3 },
      { name: 'a_opacity', size: 1 },
      { name: 'a_haloWidth', size: 1 },
    ]);
    expect(program.getAttributeLayout().reduce((sum, attribute) => sum + attribute.size, 0)).toBe(
      FLOATS_PER_VERTEX,
    );
  });

  it('writes six complete vertices with the expected two-triangle corners', () => {
    const program = new NodeCircleQuadProgram(makeGLStub());
    const pickingIndex = 0x123456;
    const [pr, pg, pb] = encodeId(pickingIndex);

    program.reallocate(1);
    program.processNode(0, 10, 20, 30, [0.1, 0.2, 0.3], pickingIndex, 2, [0.4, 0.5, 0.6], 0.7, 8);

    const buffer = usedBuffer(program);
    expect(buffer).toHaveLength(VERTICES_PER_ITEM * FLOATS_PER_VERTEX);

    for (let vertex = 0; vertex < VERTICES_PER_ITEM; vertex++) {
      const offset = vertex * FLOATS_PER_VERTEX;
      expect(buffer[offset]).toBeCloseTo(10);
      expect(buffer[offset + 1]).toBeCloseTo(20);
      expect(buffer[offset + 2]).toBeCloseTo(30);
      expect([buffer[offset + 3], buffer[offset + 4]]).toEqual(CORNERS[vertex]);
      expect(buffer[offset + 5]).toBeCloseTo(0.1);
      expect(buffer[offset + 6]).toBeCloseTo(0.2);
      expect(buffer[offset + 7]).toBeCloseTo(0.3);
      expect(buffer[offset + 8]).toBeCloseTo(pr / 255);
      expect(buffer[offset + 9]).toBeCloseTo(pg / 255);
      expect(buffer[offset + 10]).toBeCloseTo(pb / 255);
      expect(buffer[offset + 11]).toBeCloseTo(2);
      expect(buffer[offset + 12]).toBeCloseTo(0.4);
      expect(buffer[offset + 13]).toBeCloseTo(0.5);
      expect(buffer[offset + 14]).toBeCloseTo(0.6);
      expect(buffer[offset + 15]).toBeCloseTo(0.7);
      expect(buffer[offset + 16]).toBeCloseTo(8);
    }
  });

  it('builds a six-vertex static template equivalent to dynamic processing', () => {
    const style = {
      size: 48,
      color: [0.15, 0.25, 0.35] as [number, number, number],
      strokeWidth: 3,
      strokeColor: [0.45, 0.55, 0.65] as [number, number, number],
      opacity: 0.75,
      haloWidth: 6,
    };
    const template = NodeCircleQuadProgram.buildTemplate(
      style.size,
      style.color,
      style.strokeWidth,
      style.strokeColor,
      style.opacity,
      style.haloWidth,
    );

    expect(template).toHaveLength(VERTICES_PER_ITEM * FLOATS_PER_VERTEX);
    for (let vertex = 0; vertex < VERTICES_PER_ITEM; vertex++) {
      const offset = vertex * FLOATS_PER_VERTEX;
      expect(template[offset]).toBe(0);
      expect(template[offset + 1]).toBe(0);
      expect(template[offset + 2]).toBeCloseTo(style.size);
      expect([template[offset + 3], template[offset + 4]]).toEqual(CORNERS[vertex]);
      expect(Array.from(template.slice(offset + 5, offset + 8))).toEqual(
        style.color.map((value) => expect.closeTo(value)),
      );
      expect(Array.from(template.slice(offset + 8, offset + 11))).toEqual([0, 0, 0]);
      expect(template[offset + 11]).toBeCloseTo(style.strokeWidth);
      expect(Array.from(template.slice(offset + 12, offset + 15))).toEqual(
        style.strokeColor.map((value) => expect.closeTo(value)),
      );
      expect(template[offset + 15]).toBeCloseTo(style.opacity);
      expect(template[offset + 16]).toBeCloseTo(style.haloWidth);
    }

    const dynamicProgram = new NodeCircleQuadProgram(makeGLStub());
    const staticProgram = new NodeCircleQuadProgram(makeGLStub());
    dynamicProgram.reallocate(1);
    staticProgram.reallocate(1);

    dynamicProgram.processNode(
      0,
      12,
      -34,
      style.size,
      style.color,
      321,
      style.strokeWidth,
      style.strokeColor,
      style.opacity,
      style.haloWidth,
    );
    staticProgram.processNodeStatic(0, 12, -34, 321, template);

    expect(Array.from(usedBuffer(staticProgram))).toEqual(Array.from(usedBuffer(dynamicProgram)));
  });

  it('patches every style vertex of one node without changing geometry or adjacent nodes', () => {
    const program = new NodeCircleQuadProgram(makeGLStub());
    program.reallocate(2);
    program.processNode(0, 1, 2, 20, [0.1, 0.2, 0.3], 10, 1, [0.4, 0.5, 0.6], 0.8, 2);
    program.processNode(1, 30, 40, 50, [0.2, 0.3, 0.4], 20, 4, [0.5, 0.6, 0.7], 0.9, 5);

    const before = usedBuffer(program, 2);
    const firstNodeBefore = before.slice(0, VERTICES_PER_ITEM * FLOATS_PER_VERTEX);
    const geometryBefore = CORNERS.map((_, vertex) => {
      const offset = (VERTICES_PER_ITEM + vertex) * FLOATS_PER_VERTEX;
      return Array.from(before.slice(offset, offset + 2)).concat(
        Array.from(before.slice(offset + 3, offset + 5)),
        Array.from(before.slice(offset + 8, offset + 11)),
      );
    });

    program.patchNodeStyle(1, {
      size: 80,
      color: [0.7, 0.8, 0.9],
      strokeWidth: 0,
      strokeColor: [0.11, 0.22, 0.33],
      opacity: 0,
      haloWidth: 0,
    });

    const buffer = usedBuffer(program, 2);
    expect(Array.from(buffer.slice(0, VERTICES_PER_ITEM * FLOATS_PER_VERTEX))).toEqual(
      Array.from(firstNodeBefore),
    );

    for (let vertex = 0; vertex < VERTICES_PER_ITEM; vertex++) {
      const offset = (VERTICES_PER_ITEM + vertex) * FLOATS_PER_VERTEX;
      expect(
        Array.from(buffer.slice(offset, offset + 2)).concat(
          Array.from(buffer.slice(offset + 3, offset + 5)),
          Array.from(buffer.slice(offset + 8, offset + 11)),
        ),
      ).toEqual(geometryBefore[vertex]);
      expect(buffer[offset + 2]).toBeCloseTo(80);
      expect(Array.from(buffer.slice(offset + 5, offset + 8))).toEqual(
        [0.7, 0.8, 0.9].map((value) => expect.closeTo(value)),
      );
      expect(buffer[offset + 11]).toBe(0);
      expect(Array.from(buffer.slice(offset + 12, offset + 15))).toEqual(
        [0.11, 0.22, 0.33].map((value) => expect.closeTo(value)),
      );
      expect(buffer[offset + 15]).toBe(0);
      expect(buffer[offset + 16]).toBe(0);
    }
  });
});
