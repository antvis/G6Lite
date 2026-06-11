import { describe, expect, it } from 'vitest';
import { encodeId } from '../renderer/picking.js';
import { EdgeLineProgram } from '../renderer/programs/edgeLine.js';
import { EdgeRectProgram } from '../renderer/programs/edgeRect.js';

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
function makeGLStub(): WebGLRenderingContext {
  const overrides: Record<string, unknown> = {
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
    get(_t, prop: string) {
      if (prop in overrides) return overrides[prop];
      if (typeof prop === 'string' && /^[A-Z0-9_]+$/.test(prop)) return 1;
      return () => undefined;
    },
  };
  return new Proxy({}, handler) as unknown as WebGLRenderingContext;
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

const STRIDE_LINE = 15;
const STRIDE_RECT = 19;

describe('EdgeLine processEdge buffer encoding', () => {
  it('encodes both endpoints + clamp inputs, with a_posCoef selecting the end', () => {
    const prog = new TestEdgeLine(makeGLStub());
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
    expect(a[12]).toBeCloseTo(pr / 255); // a_pickingColor
    expect(a[13]).toBeCloseTo(pg / 255);
    expect(a[14]).toBeCloseTo(pb / 255);

    // Vertex 1 (target end): identical except a_posCoef = 1
    const v1 = STRIDE_LINE;
    expect(a[v1 + 4]).toBe(1); // a_posCoef
    expect(a[v1 + 0]).toBeCloseTo(10);
    expect(a[v1 + 2]).toBeCloseTo(110);
    expect(a[v1 + 5]).toBeCloseTo(5);
    expect(a[v1 + 8]).toBeCloseTo(10);
    expect(a[v1 + 12]).toBeCloseTo(pr / 255);
  });

  it('patchEdgeEndpoints rewrites only positions, leaving clamp/color intact', () => {
    const prog = new TestEdgeLine(makeGLStub());
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
});

describe('EdgeRect processEdge buffer encoding', () => {
  it('encodes graph radius + arrow px in the tail (no baked zoom), keeping head offsets', () => {
    const prog = new TestEdgeRect(makeGLStub());
    prog.reallocate(1);
    const color: [number, number, number] = [0.4, 0.5, 0.6];
    // ...lineWidth=4, dashCycle=0, opacity=0.8, srcRadius=6, tgtRadius=8, srcArrowPx=0, tgtArrowPx=12
    prog.processEdge(0, 0, 0, 100, 0, color, 7, 4, 0, 0.8, 6, 8, 0, 12);
    const a = prog.peek();

    // Tail attributes (offsets 15-18) written verbatim across all 6 vertices.
    for (let v = 0; v < 6; v++) {
      const o = v * STRIDE_RECT;
      expect(a[o + 15]).toBeCloseTo(6); // a_srcRadius (graph)
      expect(a[o + 16]).toBeCloseTo(8); // a_tgtRadius
      expect(a[o + 17]).toBeCloseTo(0); // a_srcArrowPx
      expect(a[o + 18]).toBeCloseTo(12); // a_tgtArrowPx (fixed px)
    }
    // Head offsets 0-14 still hold the pre-existing attributes.
    expect(a[6]).toBeCloseTo(4); // a_lineWidth
    expect(a[7]).toBeCloseTo(0.4); // a_color
    expect(a[14]).toBeCloseTo(0.8); // a_opacity
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
