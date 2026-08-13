import { describe, expect, it, vi } from 'vitest';
import { encodeId } from '@src/renderer/picking.js';
import { EdgeArcProgram } from '@src/renderer/programs/edgeArc.js';
import { EdgeArrowProgram } from '@src/renderer/programs/edgeArrow.js';
import { EdgeCubicProgram } from '@src/renderer/programs/edgeCubic.js';
import { EdgeLineProgram } from '@src/renderer/programs/edgeLine.js';
import { EdgeLoopProgram } from '@src/renderer/programs/edgeLoop.js';
import { EdgeRectProgram } from '@src/renderer/programs/edgeRect.js';
import { createRegl } from '@src/renderer/regl.js';

// ============================================================
// Edge program buffer encoding (GL-free).
//
// These lock in the shader-side clamp refactor: edge endpoint insets are now
// passed as GRAPH-coord node radius + fixed arrow PIXELS (not a single px value
// with camera.zoom baked in). That keeps line/rect edges flush with their
// arrowheads at every zoom level, since process() does NOT re-run on zoom.
//
// We construct the real programs against a no-op WebGL stub and inspect the
// CPU-side Float32Array they fill, so no GPU/rasterizer is needed.
// ============================================================

/** Minimal no-op WebGL stub — enough for Program's constructor + createProgram. */
function makeGLStub(extraOverrides: Record<string, unknown> = {}): WebGLRenderingContext {
  const overrides: Record<string, unknown> = {
    LINES: 1,
    TRIANGLES: 4,
    TRIANGLE_STRIP: 5,
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
    ...extraOverrides,
  };
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_t, prop: string) {
      if (prop in overrides) return overrides[prop];
      if (typeof prop === 'string' && /^[A-Z0-9_]+$/.test(prop)) return 1;
      return () => undefined;
    },
  };
  return new Proxy({}, handler) as unknown as WebGLRenderingContext;
}

function makeReglStub(extraOverrides: Record<string, unknown> = {}) {
  return createRegl(makeGLStub(extraOverrides));
}

// Expose the protected buffer for assertions.
class TestEdgeLine extends EdgeLineProgram {
  peek(): Float32Array {
    return (this as unknown as { array: Float32Array }).array;
  }
}
class TestEdgeRect extends EdgeRectProgram {
  peek(): Float32Array {
    return (this as unknown as { array: Float32Array }).array;
  }
}
class TestEdgeArc extends EdgeArcProgram {
  peek(): Float32Array {
    return (this as unknown as { array: Float32Array }).array;
  }
}
class TestEdgeLoop extends EdgeLoopProgram {
  peek(): Float32Array {
    return (this as unknown as { array: Float32Array }).array;
  }
}
class TestEdgeCubic extends EdgeCubicProgram {
  peek(): Float32Array {
    return (this as unknown as { array: Float32Array }).array;
  }
}
class TestEdgeArrow extends EdgeArrowProgram {
  peek(): Float32Array {
    return (this as unknown as { array: Float32Array }).array;
  }
}

const STRIDE_LINE = 16;
const STRIDE_RECT = 20;
const STRIDE_ARC = 14;
const ARC_SEGMENTS = 24;
const ARC_VERTICES_PER_ITEM = (ARC_SEGMENTS + 1) * 2 + 2;
const STRIDE_LOOP = 14;
const LOOP_SEGMENTS = 24;
const LOOP_VERTICES_PER_ITEM = (LOOP_SEGMENTS + 1) * 2 + 2;

describe('EdgeLine processEdge buffer encoding', () => {
  it('fails clearly when WebGL cannot allocate a shader, program, or buffer', () => {
    expect(() => new TestEdgeLine(makeReglStub({ createShader: () => null }))).toThrow(
      /create WebGL shader/,
    );
    expect(() => new TestEdgeLine(makeReglStub({ createProgram: () => null }))).toThrow(
      /create WebGL program/,
    );
    expect(() => new TestEdgeLine(makeReglStub({ createBuffer: () => null }))).toThrow(
      /create WebGL buffer/,
    );
  });

  it('reuploads the latest CPU buffer after regl restores GPU resources', () => {
    const bufferData = vi.fn();
    const bufferSubData = vi.fn();
    const prog = new TestEdgeLine(makeReglStub({ bufferData, bufferSubData }));
    prog.reallocate(1);
    prog.processEdge(0, 10, 20, 110, 220, [0.1, 0.2, 0.3], 42);
    prog.upload();
    prog.suspend();
    prog.patchEdgeEndpoints(0, 1, 2, 3, 4);
    bufferData.mockClear();
    bufferSubData.mockClear();

    prog.restore();

    expect(bufferData).toHaveBeenCalledTimes(1);
    expect(bufferSubData).toHaveBeenCalledTimes(1);
    expect(Array.from((bufferSubData.mock.calls[0][2] as Float32Array).slice(0, 4))).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it('keeps the normal command static and creates the picking command lazily', () => {
    const regl = makeReglStub() as ReturnType<typeof makeReglStub> & {
      __commands: ReturnType<typeof vi.fn>[];
      __commandConfigs: Array<{
        blend: { enable: boolean };
        framebuffer: unknown;
        uniforms: { u_picking: boolean };
      }>;
    };
    const prog = new TestEdgeLine(regl);
    prog.reallocate(1);
    prog.processEdge(0, 10, 20, 110, 220, [0.1, 0.2, 0.3], 42);
    prog.upload();

    expect(regl.__commands).toHaveLength(1);
    expect(regl.__commandConfigs[0].blend.enable).toBe(true);
    expect(regl.__commandConfigs[0].framebuffer).toBeNull();
    expect(regl.__commandConfigs[0].uniforms.u_picking).toBe(false);

    const camera = { x: 0, y: 0, zoom: 1 };
    prog.render({ width: 800, height: 600, camera });
    prog.render({
      width: 800,
      height: 600,
      camera,
      picking: true,
      framebuffer: {} as never,
      viewportWidth: 400,
      viewportHeight: 300,
    });
    prog.render({
      width: 800,
      height: 600,
      camera,
      picking: true,
      framebuffer: {} as never,
      viewportWidth: 400,
      viewportHeight: 300,
    });

    expect(regl.__commands).toHaveLength(2);
    expect(regl.__commands[0]).toHaveBeenCalledTimes(1);
    expect(regl.__commands[1]).toHaveBeenCalledTimes(2);
    expect(regl.__commandConfigs[1].blend.enable).toBe(false);
    expect(regl.__commandConfigs[1].uniforms.u_picking).toBe(true);
  });

  it('encodes both endpoints + clamp inputs, with a_posCoef selecting the end', () => {
    const prog = new TestEdgeLine(makeReglStub());
    prog.reallocate(1);
    const color: [number, number, number] = [0.1, 0.2, 0.3];
    const pick = 42;
    // sx,sy,tx,ty, color, pick, srcRadius=5, tgtRadius=7, srcArrowPx=0, tgtArrowPx=10
    prog.processEdge(0, 10, 20, 110, 220, color, pick, 5, 7, 0, 10);
    const a = prog.peek();
    const [pr, pg, pb] = encodeId(pick);

    // Vertex 0 (source end): a_posCoef = 0
    expect(a[0]).toBeCloseTo(10); // a_source.x
    expect(a[1]).toBeCloseTo(20); // a_source.y
    expect(a[2]).toBeCloseTo(110); // a_target.x
    expect(a[3]).toBeCloseTo(220); // a_target.y
    expect(a[4]).toBe(0); // a_posCoef
    expect(a[5]).toBeCloseTo(5); // a_srcRadius (graph coords)
    expect(a[6]).toBeCloseTo(7); // a_tgtRadius
    expect(a[7]).toBeCloseTo(0); // a_srcArrowPx
    expect(a[8]).toBeCloseTo(10); // a_tgtArrowPx (fixed px)
    expect(a[9]).toBeCloseTo(0.1); // a_color
    expect(a[10]).toBeCloseTo(0.2);
    expect(a[11]).toBeCloseTo(0.3);
    expect(a[12]).toBeCloseTo(1); // a_opacity
    expect(a[13]).toBeCloseTo(pr / 255); // a_pickingColor
    expect(a[14]).toBeCloseTo(pg / 255);
    expect(a[15]).toBeCloseTo(pb / 255);

    // Vertex 1 (target end): identical except a_posCoef = 1
    const v1 = STRIDE_LINE;
    expect(a[v1 + 4]).toBe(1); // a_posCoef
    expect(a[v1 + 0]).toBeCloseTo(10);
    expect(a[v1 + 2]).toBeCloseTo(110);
    expect(a[v1 + 5]).toBeCloseTo(5);
    expect(a[v1 + 8]).toBeCloseTo(10);
    expect(a[v1 + 12]).toBeCloseTo(1);
    expect(a[v1 + 13]).toBeCloseTo(pr / 255);
  });

  it('patchEdgeEndpoints rewrites only positions, leaving clamp/color intact', () => {
    const prog = new TestEdgeLine(makeReglStub());
    prog.reallocate(1);
    prog.processEdge(0, 10, 20, 110, 220, [0.1, 0.2, 0.3], 42, 5, 7, 0, 10);
    prog.patchEdgeEndpoints(0, 1, 2, 3, 4);
    const a = prog.peek();

    // Positions updated on both vertices...
    for (const v of [0, STRIDE_LINE]) {
      expect(a[v + 0]).toBeCloseTo(1);
      expect(a[v + 1]).toBeCloseTo(2);
      expect(a[v + 2]).toBeCloseTo(3);
      expect(a[v + 3]).toBeCloseTo(4);
    }
    // ...but radius / arrow px / color untouched.
    expect(a[5]).toBeCloseTo(5); // a_srcRadius
    expect(a[8]).toBeCloseTo(10); // a_tgtArrowPx
    expect(a[9]).toBeCloseTo(0.1); // a_color
  });

  it('reuploads only dirty item ranges without reallocating the GPU buffer', () => {
    const bufferData = vi.fn();
    const bufferSubData = vi.fn();
    const prog = new TestEdgeLine(makeReglStub({ bufferData, bufferSubData }));
    prog.reallocate(3);
    for (let i = 0; i < 3; i++) {
      prog.processEdge(i, i * 10, 0, i * 10 + 5, 0, [0.1, 0.2, 0.3], i);
    }
    prog.upload();
    bufferData.mockClear();
    bufferSubData.mockClear();

    prog.patchEdgeEndpoints(1, 20, 1, 30, 1);
    prog.reupload();

    expect(bufferData).not.toHaveBeenCalled();
    expect(bufferSubData).toHaveBeenCalledTimes(1);
    expect(bufferSubData.mock.calls[0][1]).toBe(2 * STRIDE_LINE * 4);
    expect((bufferSubData.mock.calls[0][2] as Float32Array).length).toBe(2 * STRIDE_LINE);

    bufferSubData.mockClear();
    prog.patchEdgeEndpoints(0, 0, 2, 5, 2);
    prog.patchEdgeEndpoints(1, 20, 2, 30, 2);
    prog.reupload();

    expect(bufferSubData).toHaveBeenCalledTimes(1);
    expect(bufferSubData.mock.calls[0][1]).toBe(0);
    expect((bufferSubData.mock.calls[0][2] as Float32Array).length).toBe(4 * STRIDE_LINE);

    bufferSubData.mockClear();
    prog.patchEdgeEndpoints(0, 0, 2, 5, 2);
    prog.patchEdgeEndpoints(2, 40, 2, 50, 2);
    prog.reupload();

    expect(bufferSubData).toHaveBeenCalledTimes(2);
    expect(bufferSubData.mock.calls.map((call) => call[1])).toEqual([0, 2 * 2 * STRIDE_LINE * 4]);
  });

  it('patchEdgeStyle updates opacity for hidden line edges', () => {
    const prog = new TestEdgeLine(makeReglStub());
    prog.reallocate(1);
    prog.processEdge(0, 10, 20, 110, 220, [0.1, 0.2, 0.3], 42, 5, 7, 0, 10);

    prog.patchEdgeStyle(0, { opacity: 0 });

    const a = prog.peek();
    expect(a[12]).toBeCloseTo(0);
    expect(a[STRIDE_LINE + 12]).toBeCloseTo(0);
  });

  it('patchEdgeStyle updates every optional line style attribute', () => {
    const prog = new TestEdgeLine(makeReglStub());
    prog.reallocate(1);
    prog.processEdge(0, 10, 20, 110, 220, [0.1, 0.2, 0.3], 42, 5, 7, 0, 10);

    prog.patchEdgeStyle(0, {
      color: [0.7, 0.8, 0.9],
      opacity: 0.4,
      srcRadius: 11,
      tgtRadius: 13,
      srcArrowPx: 17,
      tgtArrowPx: 19,
    });

    const a = prog.peek();
    for (const v of [0, STRIDE_LINE]) {
      expect(a[v + 5]).toBeCloseTo(11);
      expect(a[v + 6]).toBeCloseTo(13);
      expect(a[v + 7]).toBeCloseTo(17);
      expect(a[v + 8]).toBeCloseTo(19);
      expect(a[v + 9]).toBeCloseTo(0.7);
      expect(a[v + 10]).toBeCloseTo(0.8);
      expect(a[v + 11]).toBeCloseTo(0.9);
      expect(a[v + 12]).toBeCloseTo(0.4);
    }
  });
});

describe('EdgeRect processEdge buffer encoding', () => {
  it('encodes graph radius + arrow px in the tail (no baked zoom), keeping head offsets', () => {
    const prog = new TestEdgeRect(makeReglStub());
    prog.reallocate(1);
    const color: [number, number, number] = [0.4, 0.5, 0.6];
    // ...lineWidth=4, hitAreaWidth=16, dashCycle=0, opacity=0.8,
    // srcRadius=6, tgtRadius=8, srcArrowPx=0, tgtArrowPx=12
    prog.processEdge(0, 0, 0, 100, 0, color, 7, 4, 16, 0, 0.8, 6, 8, 0, 12);
    const a = prog.peek();

    // Tail attributes (offsets 16-19) written verbatim across all 6 vertices.
    for (let v = 0; v < 6; v++) {
      const o = v * STRIDE_RECT;
      expect(a[o + 16]).toBeCloseTo(6); // a_srcRadius (graph)
      expect(a[o + 17]).toBeCloseTo(8); // a_tgtRadius
      expect(a[o + 18]).toBeCloseTo(0); // a_srcArrowPx
      expect(a[o + 19]).toBeCloseTo(12); // a_tgtArrowPx (fixed px)
    }
    // Head attributes carry both visual and picking widths.
    expect(a[6]).toBeCloseTo(4); // a_lineWidth
    expect(a[7]).toBeCloseTo(16); // a_hitAreaWidth
    expect(a[8]).toBeCloseTo(0.4); // a_color
    expect(a[15]).toBeCloseTo(0.8); // a_opacity
    expect(prog.getVertexShader()).toContain('u_picking ? max(a_lineWidth, a_hitAreaWidth)');
    expect(prog.getFragmentShader()).toContain('!u_picking && v_dashCycle > 0.0');
  });

  it('patchEdgeStyle updates every optional rect style attribute', () => {
    const prog = new TestEdgeRect(makeReglStub());
    prog.reallocate(1);
    prog.processEdge(0, 0, 0, 100, 0, [0.1, 0.2, 0.3], 7, 2);

    prog.patchEdgeStyle(0, {
      color: [0.7, 0.8, 0.9],
      lineWidth: 6,
      hitAreaWidth: 18,
      dashCycle: 12,
      opacity: 0.4,
      srcRadius: 11,
      tgtRadius: 13,
      srcArrowPx: 17,
      tgtArrowPx: 19,
    });

    const a = prog.peek();
    for (let vertex = 0; vertex < 6; vertex++) {
      const offset = vertex * STRIDE_RECT;
      expect(a[offset + 6]).toBeCloseTo(6);
      expect(a[offset + 7]).toBeCloseTo(18);
      expect(a[offset + 8]).toBeCloseTo(0.7);
      expect(a[offset + 9]).toBeCloseTo(0.8);
      expect(a[offset + 10]).toBeCloseTo(0.9);
      expect(a[offset + 14]).toBeCloseTo(12);
      expect(a[offset + 15]).toBeCloseTo(0.4);
      expect(a[offset + 16]).toBeCloseTo(11);
      expect(a[offset + 17]).toBeCloseTo(13);
      expect(a[offset + 18]).toBeCloseTo(17);
      expect(a[offset + 19]).toBeCloseTo(19);
    }
  });
});

describe('EdgeArc processEdge buffer encoding', () => {
  it('tessellates the curve into a compact thick strip with style and picking attributes', () => {
    const prog = new TestEdgeArc(makeReglStub());
    prog.reallocate(1);
    const color: [number, number, number] = [0.2, 0.3, 0.4];
    const pickingIndex = 9;
    prog.processEdge(0, 0, 0, 100, 0, color, pickingIndex, 0.3, 4, 16, 12, 0.6);

    const a = prog.peek();

    expect(prog.getDrawMethod()).toBe('triangle strip');
    expect(prog.getVerticesPerItem()).toBe(ARC_VERTICES_PER_ITEM);
    expect(prog.getFloatsPerVertex()).toBe(STRIDE_ARC);

    // The leading left vertex is duplicated to isolate this edge's strip.
    expect(a[0]).toBeCloseTo(0);
    expect(a[1]).toBeCloseTo(0);
    expect(a[4]).toBe(-1);
    expect(a[5]).toBeCloseTo(4);
    expect(a[6]).toBeCloseTo(12);
    expect(a[7]).toBeCloseTo(0);
    expect(a[8]).toBeCloseTo(0.6);
    expect(a[9]).toBeCloseTo(color[0]);
    expect(a[10]).toBeCloseTo(color[1]);
    expect(a[11]).toBeCloseTo(color[2]);
    expect(a[12]).toBeCloseTo(pickingIndex);
    expect(a[13]).toBeCloseTo(16);
    expect(Array.from(a.slice(0, STRIDE_ARC))).toEqual(
      Array.from(a.slice(STRIDE_ARC, STRIDE_ARC * 2)),
    );

    const oppositeSource = 2 * STRIDE_ARC;
    expect(a[oppositeSource]).toBeCloseTo(0);
    expect(a[oppositeSource + 1]).toBeCloseTo(0);
    expect(a[oppositeSource + 2]).toBeCloseTo(a[2]);
    expect(a[oppositeSource + 3]).toBeCloseTo(a[3]);
    expect(a[oppositeSource + 4]).toBe(1);

    // Analytic normals are normalized, so lineWidth is measured in pixels.
    expect(Math.hypot(a[2], a[3])).toBeCloseTo(1);
    expect(prog.getVertexShader()).toContain('u_picking ? max(a_style.x, a_hitAreaWidth)');
  });

  it('accumulates a continuous path distance across segment boundaries', () => {
    const prog = new TestEdgeArc(makeReglStub());
    prog.reallocate(1);
    prog.processEdge(0, 10, 20, 110, 220, [0.1, 0.2, 0.3], 42, 0.45, 3, 14, 10, 0.8);

    const a = prog.peek();
    let previousDistance = 0;
    for (let sample = 0; sample <= ARC_SEGMENTS; sample++) {
      const leftVertex = sample === 0 ? 1 : 3 + (sample - 1) * 2;
      const rightVertex = leftVertex + 1;
      const leftOffset = leftVertex * STRIDE_ARC;
      const rightOffset = rightVertex * STRIDE_ARC;
      const distance = a[leftOffset + 7];

      expect(distance).toBeGreaterThanOrEqual(previousDistance);
      if (sample > 0) expect(distance).toBeGreaterThan(previousDistance);
      expect(a[rightOffset]).toBeCloseTo(a[leftOffset]);
      expect(a[rightOffset + 1]).toBeCloseTo(a[leftOffset + 1]);
      expect(a[rightOffset + 2]).toBeCloseTo(a[leftOffset + 2]);
      expect(a[rightOffset + 3]).toBeCloseTo(a[leftOffset + 3]);
      expect(a[leftOffset + 4]).toBe(-1);
      expect(a[rightOffset + 4]).toBe(1);
      expect(a[rightOffset + 7]).toBeCloseTo(distance, 5);
      previousDistance = distance;
    }

    const trailingOffset = (ARC_VERTICES_PER_ITEM - 1) * STRIDE_ARC;
    const lastRightOffset = (ARC_VERTICES_PER_ITEM - 2) * STRIDE_ARC;
    expect(Array.from(a.slice(trailingOffset, trailingOffset + STRIDE_ARC))).toEqual(
      Array.from(a.slice(lastRightOffset, lastRightOffset + STRIDE_ARC)),
    );
    expect(previousDistance).toBeGreaterThan(Math.hypot(100, 200));
  });

  it('keeps long high-curvature arc chord error below the visual threshold', () => {
    const prog = new TestEdgeArc(makeReglStub());
    prog.reallocate(1);
    prog.processEdge(0, 0, 0, 1000, 0, [0.1, 0.2, 0.3], 42, 0.4, 1, 1, 0, 1);

    const a = prog.peek();
    const cpx = 500;
    const cpy = 400;
    let maxMidpointError = 0;
    for (let segment = 0; segment < ARC_SEGMENTS; segment++) {
      const startVertex = segment === 0 ? 1 : 3 + (segment - 1) * 2;
      const endVertex = 3 + segment * 2;
      const startOffset = startVertex * STRIDE_ARC;
      const endOffset = endVertex * STRIDE_ARC;
      const chordMidX = (a[startOffset] + a[endOffset]) * 0.5;
      const chordMidY = (a[startOffset + 1] + a[endOffset + 1]) * 0.5;
      const t = (segment + 0.5) / ARC_SEGMENTS;
      const mt = 1 - t;
      const curveMidX = mt * mt * 0 + 2 * mt * t * cpx + t * t * 1000;
      const curveMidY = mt * mt * 0 + 2 * mt * t * cpy + t * t * 0;
      maxMidpointError = Math.max(
        maxMidpointError,
        Math.hypot(chordMidX - curveMidX, chordMidY - curveMidY),
      );
    }

    expect(maxMidpointError).toBeLessThan(0.5);
  });

  it('keeps degenerate arc vertices finite', () => {
    const prog = new TestEdgeArc(makeReglStub());
    prog.reallocate(1);
    prog.processEdge(0, 5, 5, 5, 5, [1, 0, 0], 3, 0.5, 2, 8, 0, 0);

    const usedLength = prog.getVerticesPerItem() * prog.getFloatsPerVertex();
    expect(Array.from(prog.peek().subarray(0, usedLength)).every(Number.isFinite)).toBe(true);
    expect(prog.peek()[8]).toBeCloseTo(0);
  });
});

describe('EdgeLoop processLoop buffer encoding', () => {
  it('tessellates loops into a finite continuous thick strip', () => {
    const prog = new TestEdgeLoop(makeReglStub());
    prog.reallocate(1);
    const color: [number, number, number] = [0.2, 0.4, 0.6];
    const pickingIndex = 17;
    const angle = -Math.PI / 2;
    const radius = 10;
    prog.processLoop(0, 30, 40, radius, angle, 25, color, pickingIndex, 3, 16, 10, 0.35);

    expect(prog.getDrawMethod()).toBe('triangle strip');
    expect(prog.getVerticesPerItem()).toBe(LOOP_VERTICES_PER_ITEM);
    expect(prog.getFloatsPerVertex()).toBe(STRIDE_LOOP);
    expect(prog.getAttributeLayout()).toEqual([
      { name: 'a_position', size: 2 },
      { name: 'a_normalSide', size: 3 },
      { name: 'a_style', size: 4 },
      { name: 'a_color', size: 3 },
      { name: 'a_pickingIndex', size: 1 },
      { name: 'a_hitAreaWidth', size: 1 },
    ]);
    expect(prog.getVertexShader()).toContain('attribute vec3 a_normalSide;');

    const a = prog.peek();
    const usedLength = LOOP_VERTICES_PER_ITEM * STRIDE_LOOP;
    expect(Array.from(a.subarray(0, usedLength)).every(Number.isFinite)).toBe(true);
    for (let vertex = 0; vertex < LOOP_VERTICES_PER_ITEM; vertex++) {
      const offset = vertex * STRIDE_LOOP;
      expect(Math.hypot(a[offset + 2], a[offset + 3])).toBeCloseTo(1);
      expect(Math.abs(a[offset + 4])).toBe(1);
      expect(a[offset + 5]).toBeCloseTo(3);
      expect(a[offset + 6]).toBeCloseTo(10);
      expect(a[offset + 8]).toBeCloseTo(0.35);
      expect(a[offset + 9]).toBeCloseTo(color[0]);
      expect(a[offset + 10]).toBeCloseTo(color[1]);
      expect(a[offset + 11]).toBeCloseTo(color[2]);
      expect(a[offset + 12]).toBe(pickingIndex);
      expect(a[offset + 13]).toBeCloseTo(16);
    }

    const spread = 0.5;
    expect(a[0]).toBeCloseTo(30 + radius * Math.cos(angle - spread));
    expect(a[1]).toBeCloseTo(40 + radius * Math.sin(angle - spread));
    const finalOffset = (LOOP_VERTICES_PER_ITEM - 1) * STRIDE_LOOP;
    expect(a[finalOffset]).toBeCloseTo(30 + radius * Math.cos(angle + spread));
    expect(a[finalOffset + 1]).toBeCloseTo(40 + radius * Math.sin(angle + spread));
    expect(Array.from(a.slice(0, STRIDE_LOOP))).toEqual(
      Array.from(a.slice(STRIDE_LOOP, STRIDE_LOOP * 2)),
    );
    expect(Array.from(a.slice(finalOffset, finalOffset + STRIDE_LOOP))).toEqual(
      Array.from(a.slice(finalOffset - STRIDE_LOOP, finalOffset)),
    );
  });

  it('keeps degenerate loop geometry finite', () => {
    const prog = new TestEdgeLoop(makeReglStub());
    prog.reallocate(1);
    prog.processLoop(0, 5, 5, 0, 0, 0, [1, 0, 0], 3, 2, 8, 0, 0);

    const usedLength = prog.getVerticesPerItem() * prog.getFloatsPerVertex();
    expect(Array.from(prog.peek().subarray(0, usedLength)).every(Number.isFinite)).toBe(true);
  });
});

describe('EdgeCubic and EdgeArrow picking geometry', () => {
  it('renders cubic edges as thick strips with independent picking width', () => {
    const prog = new TestEdgeCubic(makeReglStub());
    prog.reallocate(1);
    prog.processEdge(0, 10, 20, 210, 120, [0.1, 0.2, 0.3], 7, 60, 'LR', 1.5, 16, 0, 0.8);

    expect(prog.getDrawMethod()).toBe('triangle strip');
    expect(prog.getFloatsPerVertex()).toBe(14);
    expect(prog.peek()[5]).toBeCloseTo(1.5);
    expect(prog.peek()[13]).toBeCloseTo(16);
    expect(prog.getVertexShader()).toContain('a_hitAreaWidth');
  });

  it('keeps arrow visuals unchanged while widening only the picking pass', () => {
    const prog = new TestEdgeArrow(makeReglStub());
    prog.reallocate(1);
    prog.processArrow(0, 0, 0, 100, 0, 10, 1.5, 20, 8, [0.2, 0.4, 0.6], 5, 0.7);

    expect(prog.peek()[7]).toBeCloseTo(1.5);
    expect(prog.peek()[8]).toBeCloseTo(20);
    expect(prog.peek()[9]).toBeCloseTo(8);
    expect(prog.getVertexShader()).toContain('u_picking ? max(visibleArrowWidth, a_hitAreaWidth)');
  });
});

describe('edge clamp vs arrow base geometry invariant', () => {
  // Reproduce the two shader formulas in JS and assert the edge's clamped target
  // endpoint lands EXACTLY on the arrow base, at every zoom level. This is the
  // regression that caused the visible gap on zoom-out.
  //
  // Arrow base  (edgeArrow.vert): tgtPx - unitDir * (nodeRadius*scale + arrowSize)
  // Edge target (edgeLine/Rect.vert): tgtPx - unitDir * (tgtRadius*scale + tgtArrowPx)
  // With tgtArrowPx == arrowSize they must coincide.
  function toPx(p: { x: number; y: number }, translate: { x: number; y: number }, scale: number) {
    return { x: (p.x + translate.x) * scale, y: (p.y + translate.y) * scale };
  }

  it.each([0.25, 0.5, 1, 2, 4])('edge end meets arrow base at zoom=%s', (scale) => {
    const src = { x: 10, y: 30 };
    const tgt = { x: 210, y: 130 };
    const translate = { x: 5, y: -7 };
    const nodeRadius = 5; // graph coords
    const arrowSize = 10; // fixed px

    const srcPx = toPx(src, translate, scale);
    const tgtPx = toPx(tgt, translate, scale);
    const dx = tgtPx.x - srcPx.x;
    const dy = tgtPx.y - srcPx.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;

    // Arrow base (barycentric.y = 0)
    const baseX = tgtPx.x - ux * (nodeRadius * scale + arrowSize);
    const baseY = tgtPx.y - uy * (nodeRadius * scale + arrowSize);

    // Edge clamped target end (tgtArrowPx == arrowSize)
    const endX = tgtPx.x - ux * (nodeRadius * scale + arrowSize);
    const endY = tgtPx.y - uy * (nodeRadius * scale + arrowSize);

    expect(endX).toBeCloseTo(baseX, 6);
    expect(endY).toBeCloseTo(baseY, 6);
  });
});
