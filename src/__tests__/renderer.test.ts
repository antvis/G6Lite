import { beforeEach, describe, expect, it } from 'vitest';
import { encodeId } from '../renderer/picking.js';
import { Renderer } from '../renderer/renderer.js';
import { analyzeNodeConfig } from '../renderer/style.js';
import { resolveTheme } from '../theme.js';
import type { EdgeConfig, GraphEdge, LayoutNode, ThemeTokens } from '../types.js';

// ============================================================
// Q2 — Renderer regression (jsdom + WebGL stub).
//
// jsdom has no WebGL, so we feed the *real* Renderer a stub gl context.
// This exercises the parts of renderer.ts that don't depend on the GPU
// rasterizer: the data pipeline (setData → node/edge counts + index maps)
// and hit detection (CPU geometry picking + GPU picking-id decode), which
// is exactly what Roadmap Q2 asks for ("校验节点/边数量与 picking").
//
// The 9 pre-existing test files never construct a real Renderer; this file
// is the first regression coverage of src/renderer/renderer.ts.
// ============================================================

const theme: ThemeTokens = resolveTheme('light');

/**
 * A recursive no-op WebGL stub. Any unknown method returns another proxy so
 * call chains never throw; the few methods whose *return value* the renderer
 * branches on are overridden explicitly. `readPixels` writes a controllable
 * pixel so we can drive the GPU picking decode path deterministically.
 */
function makeGLStub(): {
  gl: WebGLRenderingContext;
  setPickPixel: (rgba: [number, number, number, number]) => void;
} {
  let pickPixel: [number, number, number, number] = [0, 0, 0, 0];

  const overrides: Record<string, unknown> = {
    // gl.ts createProgram() branches on these — must report success.
    getShaderParameter: () => true,
    getProgramParameter: () => true,
    getShaderInfoLog: () => '',
    getProgramInfoLog: () => '',
    // Locations are looked up and cached; any non-null sentinel works.
    getUniformLocation: () => ({}),
    getAttribLocation: () => 0,
    getExtension: () => null,
    createShader: () => ({}),
    createProgram: () => ({}),
    createBuffer: () => ({}),
    createFramebuffer: () => ({}),
    createTexture: () => ({}),
    createRenderbuffer: () => ({}),
    // picking.pickAt() reads one pixel from the picking framebuffer.
    readPixels: (
      _x: number,
      _y: number,
      _w: number,
      _h: number,
      _fmt: number,
      _type: number,
      out: Uint8Array,
    ) => {
      out[0] = pickPixel[0];
      out[1] = pickPixel[1];
      out[2] = pickPixel[2];
      out[3] = pickPixel[3];
    },
  };

  // Numeric GL enums are accessed as properties (gl.BLEND, gl.RGBA, ...).
  // A proxy returns a callable-or-number for every property name.
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop: string) {
      if (prop in overrides) return overrides[prop];
      // Heuristic: ALL_CAPS names are GL enum constants → return a number.
      if (typeof prop === 'string' && /^[A-Z0-9_]+$/.test(prop)) return 1;
      // Everything else is a method → no-op returning undefined.
      return () => undefined;
    },
  };

  const gl = new Proxy({}, handler) as unknown as WebGLRenderingContext;
  return {
    gl,
    setPickPixel(rgba) {
      pickPixel = rgba;
    },
  };
}

function makeCanvas(): {
  canvas: HTMLCanvasElement;
  setPickPixel: (rgba: [number, number, number, number]) => void;
} {
  const canvas = document.createElement('canvas');
  const { gl, setPickPixel } = makeGLStub();
  // Renderer calls canvas.getContext('webgl', ...) via getGL().
  (canvas as unknown as { getContext: () => unknown }).getContext = () => gl;
  // jsdom returns a zero-size rect; give picking a stable mapping.
  canvas.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON() {},
    } as DOMRect);
  return { canvas, setPickPixel };
}

function rendererData(nodes: LayoutNode[], edges: GraphEdge[]): Parameters<Renderer['setData']>[0] {
  return { nodes, edges, theme };
}

describe('Renderer — construction', () => {
  it('constructs against a WebGL stub without throwing', () => {
    const { canvas } = makeCanvas();
    expect(() => new Renderer(canvas)).not.toThrow();
  });

  it('rejects a non-canvas container', () => {
    const div = document.createElement('div');
    expect(() => new Renderer(div as unknown as HTMLCanvasElement)).toThrow(/canvas/);
  });
});

describe('Renderer — data pipeline', () => {
  let renderer: Renderer;

  beforeEach(() => {
    const { canvas } = makeCanvas();
    renderer = new Renderer(canvas);
  });

  it('exposes node/edge counts matching the data fed via setData', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 100, y: 0 },
      { id: 'c', x: 0, y: 100 },
    ];
    const edges: GraphEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];
    renderer.setData(rendererData(nodes, edges));

    expect(renderer.getNodes()).toHaveLength(3);
    expect(renderer.getEdges()).toHaveLength(2);
  });

  it('builds an id→index map covering every node', () => {
    const nodes: LayoutNode[] = [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 1, y: 1 },
      { id: 'c', x: 2, y: 2 },
    ];
    renderer.setData(rendererData(nodes, []));

    const map = renderer.getNodeIdToIndex();
    expect(map.get('a')).toBe(0);
    expect(map.get('b')).toBe(1);
    expect(map.get('c')).toBe(2);
    expect(map.has('missing')).toBe(false);
  });

  it('uses rect edges when state styles require non-line attributes', () => {
    const config: EdgeConfig = {
      type: 'line',
      style: { lineWidth: 1 },
      stateStyles: {
        selected: { lineWidth: 2 },
      },
    };

    expect((renderer as any).resolveEdgeType(config)).toBe('rect');
  });

  it('replaces data fully on a second setData (no stale nodes)', () => {
    renderer.setData(
      rendererData(
        [
          { id: 'old1', x: 0, y: 0 },
          { id: 'old2', x: 1, y: 1 },
        ],
        [{ source: 'old1', target: 'old2' }],
      ),
    );
    expect(renderer.getNodes()).toHaveLength(2);

    renderer.setData(rendererData([{ id: 'new1', x: 0, y: 0 }], []));

    expect(renderer.getNodes()).toHaveLength(1);
    expect(renderer.getEdges()).toHaveLength(0);
    expect(renderer.getNodeIdToIndex().has('old1')).toBe(false);
    expect(renderer.getNodeIdToIndex().get('new1')).toBe(0);
  });
});

describe('Renderer — CPU geometry picking (hitTest)', () => {
  let renderer: Renderer;

  beforeEach(() => {
    const { canvas } = makeCanvas();
    renderer = new Renderer(canvas);
    // Static config so resolveNodeStyle takes the cached fast path with a known size.
    const nodeConfig = { type: 'circle' as const, style: { size: 20 } };
    analyzeNodeConfig(nodeConfig, theme);
    renderer.setData({
      nodes: [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 200, y: 0 },
      ],
      edges: [{ source: 'a', target: 'b' }],
      theme,
      nodeConfig,
    });
  });

  it('hits the node whose radius covers the query point', () => {
    expect(renderer.hitTestNode(0, 0)).toBe('a');
    expect(renderer.hitTestNode(200, 0)).toBe('b');
  });

  it('returns null when the point falls outside every node', () => {
    expect(renderer.hitTestNode(1000, 1000)).toBeNull();
  });

  it('hits the edge near its segment and misses far away', () => {
    // Edge a→b runs along y=0 from x=0 to x=200; threshold is 8px.
    expect(renderer.hitTestEdge(100, 2)).toBe(0);
    expect(renderer.hitTestEdge(100, 50)).toBe(-1);
  });
});

describe('Renderer — GPU picking decode (pickAt)', () => {
  function setup() {
    const { canvas, setPickPixel } = makeCanvas();
    // jsdom doesn't lay out the canvas; force a backing size so pickAt's
    // lazy picking-pass init (w>0 && h>0) and coord scaling run.
    Object.defineProperty(canvas, 'width', { value: 800, writable: true });
    Object.defineProperty(canvas, 'height', { value: 600, writable: true });
    const renderer = new Renderer(canvas);
    renderer.resize(800, 600);
    renderer.setData({
      nodes: [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 100, y: 0 },
      ],
      edges: [{ source: 'a', target: 'b' }],
      theme,
    });
    // Mirror Graph.render(): a draw() runs process(), which is what registers
    // the node count with the picking manager (node-vs-edge id boundary).
    renderer.draw();
    return { renderer, setPickPixel };
  }

  it('decodes a node picking color to the right node id', () => {
    const { renderer, setPickPixel } = setup();
    // Node index 0 → encodeId shifts by +1 → color for id 0.
    const [r, g, b] = encodeId(0);
    setPickPixel([r, g, b, 255]);
    expect(renderer.pickAt(5, 5)).toEqual({ type: 'node', id: 'a' });

    const [r1, g1, b1] = encodeId(1);
    setPickPixel([r1, g1, b1, 255]);
    expect(renderer.pickAt(5, 5)).toEqual({ type: 'node', id: 'b' });
  });

  it('decodes an edge picking color (id past nodeCount) to an edge index', () => {
    const { renderer, setPickPixel } = setup();
    // 2 nodes → encoded index 2 is the first edge (edge index 0).
    const [r, g, b] = encodeId(2);
    setPickPixel([r, g, b, 255]);
    expect(renderer.pickAt(5, 5)).toEqual({ type: 'edge', index: 0 });
  });

  it('returns null for the background (alpha = 0)', () => {
    const { renderer, setPickPixel } = setup();
    setPickPixel([0, 0, 0, 0]);
    expect(renderer.pickAt(5, 5)).toBeNull();
  });
});
