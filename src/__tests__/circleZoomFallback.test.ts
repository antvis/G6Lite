import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataModel } from '../dataModel.js';
import { Renderer } from '../renderer/renderer.js';
import { analyzeNodeConfig } from '../renderer/style.js';
import { resolveTheme } from '../theme.js';
import type { LayoutNode, NodeConfig, ThemeTokens } from '../types.js';

const theme: ThemeTokens = resolveTheme('light');

type CircleMode = 'point' | 'quad';
type ProgramState = { itemCount: number };
type RendererInternals = {
  circleRenderMode: CircleMode;
  maxCircleExtent: number;
  needToProcess: boolean;
  needPickingRender: boolean;
  _programs: Partial<{
    nodeCircle: ProgramState;
    nodeCircleQuad: ProgramState;
  }>;
};

/** Minimal WebGL stub whose point-size capability is configurable per test. */
function makeGLStub(maxPointSize: number): WebGLRenderingContext {
  const overrides: Record<string, unknown> = {
    getParameter: () => new Float32Array([1, maxPointSize]),
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
    createFramebuffer: () => ({}),
    createTexture: () => ({}),
    createRenderbuffer: () => ({}),
    readPixels: (
      _x: number,
      _y: number,
      _width: number,
      _height: number,
      _format: number,
      _type: number,
      pixels: Uint8Array,
    ) => pixels.fill(0),
  };

  return new Proxy(
    {},
    {
      get(_target, property: string) {
        if (property in overrides) return overrides[property];
        if (/^[A-Z0-9_]+$/.test(property)) return 1;
        return () => undefined;
      },
    },
  ) as unknown as WebGLRenderingContext;
}

function makeCanvas(maxPointSize: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const gl = makeGLStub(maxPointSize);
  (canvas as unknown as { getContext: () => WebGLRenderingContext }).getContext = () => gl;
  canvas.getBoundingClientRect = () => {
    const rect = {
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON() {},
    };
    return rect as DOMRect;
  };
  return canvas;
}

function internals(renderer: Renderer): RendererInternals {
  return renderer as unknown as RendererInternals;
}

function setSingleCircle(renderer: Renderer, nodeConfig: NodeConfig, node?: LayoutNode): void {
  analyzeNodeConfig(nodeConfig, theme);
  renderer.setData({
    nodes: [node ?? { id: 'node', x: 0, y: 0 }],
    edges: [],
    nodeConfig,
    theme,
  });
}

describe('Renderer circle zoom fallback', () => {
  const renderers: Renderer[] = [];
  let nextFrameId = 0;

  beforeEach(() => {
    nextFrameId = 0;
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => ++nextFrameId),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    for (const renderer of renderers.splice(0)) renderer.destroy();
    vi.unstubAllGlobals();
  });

  function createRenderer(maxPointSize = 100): Renderer {
    const renderer = new Renderer(makeCanvas(maxPointSize));
    renderer.resize(800, 600);
    renderers.push(renderer);
    return renderer;
  }

  it('keeps ordinary zoom on the one-vertex point program', () => {
    const renderer = createRenderer();
    setSingleCircle(renderer, { type: 'circle', style: { size: 40 } });

    renderer.draw();

    const state = internals(renderer);
    expect(state.circleRenderMode).toBe('point');
    expect(state._programs.nodeCircle?.itemCount).toBe(1);
    expect(state._programs.nodeCircleQuad).toBeUndefined();
  });

  it('automatically rebuilds with quads during an initial high-zoom full process', () => {
    const renderer = createRenderer();
    renderer.setCamera({ zoom: 3 });
    setSingleCircle(renderer, { type: 'circle', style: { size: 40 } });

    renderer.draw();

    const state = internals(renderer);
    expect(state.circleRenderMode).toBe('quad');
    expect(state._programs.nodeCircleQuad?.itemCount).toBe(1);
    expect(state.needToProcess).toBe(false);
  });

  it('enters at 90%, stays quad in the hysteresis band, and exits at 75%', () => {
    const renderer = createRenderer();
    setSingleCircle(renderer, { type: 'circle', style: { size: 40 } });
    renderer.draw();

    renderer.setCamera({ zoom: 2.25 }); // 40 * 2.25 = 90 = max * 0.9
    expect(internals(renderer).circleRenderMode).toBe('quad');
    renderer.draw();
    expect(internals(renderer)._programs.nodeCircleQuad?.itemCount).toBe(1);

    renderer.setCamera({ zoom: 2 }); // 80 lies between the 75/90 thresholds
    expect(internals(renderer).circleRenderMode).toBe('quad');
    expect(internals(renderer).needToProcess).toBe(false);
    renderer.draw();
    expect(internals(renderer)._programs.nodeCircleQuad?.itemCount).toBe(1);

    renderer.setCamera({ zoom: 1.875 }); // 40 * 1.875 = 75 = max * 0.75
    expect(internals(renderer).circleRenderMode).toBe('point');
    renderer.draw();
    expect(internals(renderer)._programs.nodeCircle?.itemCount).toBe(1);
    expect(internals(renderer).needToProcess).toBe(false);
  });

  it('includes halo width on both sides when deciding whether points are safe', () => {
    const renderer = createRenderer();
    renderer.setCamera({ zoom: 1.5 });
    setSingleCircle(
      renderer,
      {
        type: 'circle',
        style: { size: 40 },
        stateStyles: { active: { haloWidth: 10 } },
      },
      { id: 'node', x: 0, y: 0, states: ['active'] },
    );

    renderer.draw();

    const state = internals(renderer);
    expect(state.maxCircleExtent).toBe(60);
    expect(state.circleRenderMode).toBe('quad');
    expect(state._programs.nodeCircleQuad?.itemCount).toBe(1);
  });

  it.each([
    ['first picking pass', false],
    ['already initialized picking framebuffer', true],
  ])('synchronously fills the new backend before %s', (_label, initializePicking) => {
    const renderer = createRenderer();
    setSingleCircle(renderer, { type: 'circle', style: { size: 40 } });
    renderer.draw();
    if (initializePicking) renderer.pickAt(0, 0);

    renderer.setCamera({ zoom: 2.25 });
    expect(internals(renderer).circleRenderMode).toBe('quad');
    expect(internals(renderer).needToProcess).toBe(true);

    renderer.pickAt(0, 0);

    const state = internals(renderer);
    expect(state._programs.nodeCircleQuad?.itemCount).toBe(1);
    expect(state.needToProcess).toBe(false);
    expect(state.needPickingRender).toBe(false);
  });

  it('patches a halo-only extent change without forcing a full process below the threshold', () => {
    const nodeConfig: NodeConfig = {
      type: 'circle',
      style: { size: 40 },
      stateStyles: { active: { haloWidth: 4 } },
    };
    analyzeNodeConfig(nodeConfig, theme);
    const model = new DataModel({ nodeConfig, theme });
    model.addNode({ id: 'node', x: 0, y: 0 });

    const renderer = createRenderer();
    renderer.setData({
      nodes: model.getNodes() as unknown as LayoutNode[],
      edges: [],
      nodeConfig,
      theme,
    });
    renderer.draw();
    model.setNodeState('node', 'active', true);

    renderer.patchStyles(model, new Set(['node']), new Set());

    const state = internals(renderer);
    expect(state.maxCircleExtent).toBe(48);
    expect(state.circleRenderMode).toBe('point');
    expect(state.needToProcess).toBe(false);
  });

  it('marks a node size change for a full process so the fallback extent is recomputed', () => {
    const nodeConfig: NodeConfig = {
      type: 'circle',
      style: { size: (node) => Number(node.data?.size ?? 40) },
    };
    analyzeNodeConfig(nodeConfig, theme);
    const model = new DataModel({ nodeConfig, theme });
    model.addNode({ id: 'node', x: 0, y: 0, data: { size: 40 } });

    const renderer = createRenderer();
    renderer.setData({
      nodes: model.getNodes() as unknown as LayoutNode[],
      edges: [],
      nodeConfig,
      theme,
    });
    renderer.draw();
    model.updateNodeData('node', { size: 50 });

    renderer.patchStyles(model, new Set(['node']), new Set());

    expect(internals(renderer).needToProcess).toBe(true);
  });
});
