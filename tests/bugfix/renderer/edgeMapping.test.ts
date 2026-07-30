import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataModel } from '@src/dataModel.js';
import { encodeId } from '@src/renderer/picking.js';
import { Renderer } from '@src/renderer/renderer.js';
import { analyzeEdgeConfig, analyzeNodeConfig } from '@src/renderer/style.js';
import { resolveTheme } from '@src/theme.js';
import type {
  EdgeConfig,
  GraphEdge,
  LayoutNode,
  ParallelEdgeMeta,
  ThemeTokens,
} from '@src/types.js';

const theme: ThemeTokens = resolveTheme('light');

interface InspectableProgram {
  array: Float32Array;
  itemCount: number;
}

interface RendererInternals {
  _programs: Record<string, InspectableProgram | undefined>;
  edgeDrawStart: Int32Array;
  edgeDrawCount: Int32Array;
  edgeLoopSlot: Int32Array;
  edgeArrowStart: Int32Array;
  edgeArrowCount: Int32Array;
  nodeEdgeOffsets: Uint32Array;
  nodeEdgeIndices: Uint32Array;
}

function makeGLStub(): {
  gl: WebGLRenderingContext;
  setPickPixel: (rgba: [number, number, number, number]) => void;
} {
  let pickPixel: [number, number, number, number] = [0, 0, 0, 0];
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
    createFramebuffer: () => ({}),
    createTexture: () => ({}),
    createRenderbuffer: () => ({}),
    checkFramebufferStatus: () => 1,
    readPixels: (
      _x: number,
      _y: number,
      _width: number,
      _height: number,
      _format: number,
      _type: number,
      output: Uint8Array,
    ) => {
      output[0] = pickPixel[0];
      output[1] = pickPixel[1];
      output[2] = pickPixel[2];
      output[3] = pickPixel[3];
    },
  };

  const gl = new Proxy<Record<string, unknown>>(
    {},
    {
      get(_target, property: string) {
        if (property in overrides) return overrides[property];
        if (/^[A-Z0-9_]+$/.test(property)) return 1;
        return () => undefined;
      },
    },
  ) as unknown as WebGLRenderingContext;

  return {
    gl,
    setPickPixel(rgba) {
      pickPixel = rgba;
    },
  };
}

function makeRenderer(): {
  renderer: Renderer;
  setPickPixel: (rgba: [number, number, number, number]) => void;
} {
  const canvas = document.createElement('canvas');
  const { gl, setPickPixel } = makeGLStub();
  (canvas as unknown as { getContext: () => WebGLRenderingContext }).getContext = () => gl;
  const bounds = {
    left: 0,
    top: 0,
    width: 800,
    height: 600,
    right: 800,
    bottom: 600,
    x: 0,
    y: 0,
    toJSON() {},
  } as DOMRect;
  canvas.getBoundingClientRect = () => bounds;

  const renderer = new Renderer(canvas);
  renderer.resize(800, 600);
  return { renderer, setPickPixel };
}

function makeLineConfig(): EdgeConfig {
  const config: EdgeConfig = {
    type: 'line',
    style: {
      stroke: '#ff0000',
      lineWidth: 1,
      startArrow: false,
      endArrow: false,
    },
  };
  analyzeEdgeConfig(config, theme);
  return config;
}

function setRendererData(
  renderer: Renderer,
  nodes: LayoutNode[],
  edges: GraphEdge[],
  edgeConfig: EdgeConfig,
): void {
  renderer.setData({ nodes, edges, edgeConfig, theme });
  renderer.draw();
}

describe('Renderer dense edge-slot mapping', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => 1),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('patches the dense visible slot after a preceding hidden edge is omitted', () => {
    const edgeConfig = makeLineConfig();
    const dataModel = new DataModel({ edgeConfig, theme });
    dataModel.replaceData(
      [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 100, y: 0 },
        { id: 'c', x: 200, y: 0 },
      ],
      [
        { id: 'hidden', source: 'a', target: 'b', states: ['hidden'] },
        { id: 'visible', source: 'b', target: 'c' },
      ],
    );

    const { renderer } = makeRenderer();
    setRendererData(
      renderer,
      dataModel.getNodes() as LayoutNode[],
      dataModel.getEdges() as GraphEdge[],
      edgeConfig,
    );

    const internals = renderer as unknown as RendererInternals;
    const edgeLine = internals._programs.edgeLine!;
    expect(Array.from(internals.edgeDrawStart.slice(0, 2))).toEqual([-1, 0]);
    expect(Array.from(internals.edgeDrawCount.slice(0, 2))).toEqual([0, 1]);
    expect(Array.from(internals.edgeArrowStart.slice(0, 2))).toEqual([-1, -1]);
    expect(Array.from(internals.edgeArrowCount.slice(0, 2))).toEqual([0, 0]);
    expect(Array.from(internals.nodeEdgeOffsets)).toEqual([0, 1, 3, 4]);
    expect(Array.from(internals.nodeEdgeIndices)).toEqual([0, 0, 1, 1]);
    expect(edgeLine.itemCount).toBe(1);
    expect(Array.from(edgeLine.array.slice(0, 4))).toEqual([100, 0, 200, 0]);

    dataModel.updateNodePosition('c', 260, 40);
    renderer.patchPositions(dataModel, new Set(['c']));

    expect(edgeLine.itemCount).toBe(1);
    expect(Array.from(edgeLine.array.slice(0, 4))).toEqual([100, 0, 260, 40]);
  });

  it('patches dense rect-edge endpoints and direction-dependent boundary distances', () => {
    const nodeConfig = { type: 'rect' as const, style: { width: 80, height: 20 } };
    const edgeConfig: EdgeConfig = {
      type: 'line',
      style: {
        stroke: '#ff0000',
        lineWidth: 4,
        startArrow: false,
        endArrow: false,
      },
    };
    analyzeNodeConfig(nodeConfig, theme);
    analyzeEdgeConfig(edgeConfig, theme);
    const dataModel = new DataModel({ nodeConfig, edgeConfig, theme });
    dataModel.replaceData(
      [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 100, y: 0 },
        { id: 'c', x: 200, y: 0 },
      ],
      [
        { id: 'hidden', source: 'a', target: 'b', states: ['hidden'] },
        { id: 'visible', source: 'b', target: 'c' },
      ],
    );

    const { renderer } = makeRenderer();
    renderer.setData({
      nodes: dataModel.getNodes() as LayoutNode[],
      edges: dataModel.getEdges() as GraphEdge[],
      nodeConfig,
      edgeConfig,
      theme,
    });
    renderer.draw();

    const internals = renderer as unknown as RendererInternals;
    const edgeRect = internals._programs.edgeRect!;
    expect(Array.from(internals.edgeDrawStart.slice(0, 2))).toEqual([-1, 0]);
    expect(edgeRect.itemCount).toBe(1);
    expect(Array.from(edgeRect.array.slice(0, 4))).toEqual([100, 0, 200, 0]);
    expect(edgeRect.array[15]).toBeCloseTo(40);
    expect(edgeRect.array[16]).toBeCloseTo(40);

    dataModel.updateNodePosition('c', 100, 100);
    renderer.patchPositions(dataModel, new Set(['c']));

    expect(Array.from(edgeRect.array.slice(0, 4))).toEqual([100, 0, 100, 100]);
    expect(edgeRect.array[15]).toBeCloseTo(10);
    expect(edgeRect.array[16]).toBeCloseTo(10);
  });

  it('applies highlight colors through original-edge-index to dense-slot mapping', () => {
    const edgeConfig = makeLineConfig();
    const { renderer } = makeRenderer();
    const nodes: LayoutNode[] = [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 100, y: 0 },
      { id: 'c', x: 200, y: 0 },
      { id: 'd', x: 300, y: 0 },
    ];
    const edges: GraphEdge[] = [
      { source: 'a', target: 'b', states: new Set(['hidden']) as GraphEdge['states'] },
      { source: 'b', target: 'c' },
      { source: 'c', target: 'd' },
    ];
    setRendererData(renderer, nodes, edges, edgeConfig);

    renderer.setHighlight({ nodeIds: new Set(['c', 'd']), edgeIndices: new Set([2]) });
    renderer.draw();

    const internals = renderer as unknown as RendererInternals;
    const edgeLine = internals._programs.edgeLine!;
    const floatsPerItem = 2 * 16;
    const colorOffset = 9;
    const firstVisibleColor = Array.from(edgeLine.array.slice(colorOffset, colorOffset + 3));
    const highlightedColor = Array.from(
      edgeLine.array.slice(floatsPerItem + colorOffset, floatsPerItem + colorOffset + 3),
    );

    expect(Array.from(internals.edgeDrawStart.slice(0, 3))).toEqual([-1, 0, 1]);
    expect(firstVisibleColor[0]).toBeCloseTo(1);
    expect(firstVisibleColor[1]).toBeCloseTo(0.75);
    expect(firstVisibleColor[2]).toBeCloseTo(0.75);
    expect(highlightedColor).toEqual([1, 0, 0]);
  });

  it('applies highlight colors through dense self-loop slots', () => {
    const edgeConfig = makeLineConfig();
    const { renderer } = makeRenderer();
    const nodes: LayoutNode[] = [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 100, y: 0 },
    ];
    const edges: GraphEdge[] = [
      { source: 'a', target: 'a', states: new Set(['hidden']) as GraphEdge['states'] },
      { source: 'a', target: 'a' },
      { source: 'b', target: 'b' },
    ];
    setRendererData(renderer, nodes, edges, edgeConfig);

    renderer.setHighlight({ nodeIds: new Set(['b']), edgeIndices: new Set([2]) });
    renderer.draw();

    const internals = renderer as unknown as RendererInternals;
    const edgeLoop = internals._programs.edgeLoop!;
    const floatsPerLoop = ((24 + 1) * 2 + 2) * 13;
    const colorOffset = 9;
    const firstVisibleColor = Array.from(edgeLoop.array.slice(colorOffset, colorOffset + 3));
    const highlightedColor = Array.from(
      edgeLoop.array.slice(floatsPerLoop + colorOffset, floatsPerLoop + colorOffset + 3),
    );

    expect(Array.from(internals.edgeLoopSlot.slice(0, 3))).toEqual([-1, 0, 1]);
    expect(firstVisibleColor[0]).toBeCloseTo(1);
    expect(firstVisibleColor[1]).toBeCloseTo(0.75);
    expect(firstVisibleColor[2]).toBeCloseTo(0.75);
    expect(highlightedColor).toEqual([1, 0, 0]);
  });

  it('encodes and decodes the original edge index rather than the dense draw slot', () => {
    const edgeConfig = makeLineConfig();
    const { renderer, setPickPixel } = makeRenderer();
    const nodes: LayoutNode[] = [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 100, y: 0 },
      { id: 'c', x: 200, y: 0 },
    ];
    const edges: GraphEdge[] = [
      { source: 'a', target: 'b', states: new Set(['hidden']) as GraphEdge['states'] },
      { source: 'b', target: 'c' },
    ];
    setRendererData(renderer, nodes, edges, edgeConfig);

    const edgeLine = (renderer as unknown as RendererInternals)._programs.edgeLine!;
    const pickingOffset = 13;
    const expectedPickingBytes = encodeId(nodes.length + 1);
    const pickingColor = Array.from(edgeLine.array.slice(pickingOffset, pickingOffset + 3));
    expectedPickingBytes.forEach((channel, index) => {
      expect(pickingColor[index]).toBeCloseTo(channel / 255);
    });

    setPickPixel([...expectedPickingBytes, 255]);
    expect(renderer.pickAt(10, 10)).toEqual({ type: 'edge', index: 1 });
  });

  it('forwards thick dashed styles when parallel metadata selects the arc program', () => {
    const edgeConfig: EdgeConfig = {
      type: 'line',
      style: {
        stroke: '#123456',
        lineWidth: 6,
        lineDash: [3, 5],
        opacity: 0.4,
        startArrow: false,
        endArrow: false,
      },
    };
    analyzeEdgeConfig(edgeConfig, theme);
    const parallel: ParallelEdgeMeta = {
      groupKey: 'a--b',
      groupSize: 2,
      groupIndex: 0,
      sameDirectionIndex: 0,
      sameDirectionSize: 2,
      directionSign: 1,
      offset: -10,
      curvature: -0.1,
      isReversedInGroup: false,
    };
    const edge = { source: 'a', target: 'b', parallel } as GraphEdge & {
      parallel: ParallelEdgeMeta;
    };
    const { renderer } = makeRenderer();
    setRendererData(
      renderer,
      [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 100, y: 0 },
      ],
      [edge],
      edgeConfig,
    );

    const internals = renderer as unknown as RendererInternals;
    const edgeArc = internals._programs.edgeArc!;
    expect(edgeArc.itemCount).toBe(1);
    expect(internals._programs.edgeLine).toBeUndefined();
    expect(edgeArc.array[5]).toBeCloseTo(6);
    expect(edgeArc.array[6]).toBeCloseTo(8);
    expect(edgeArc.array[8]).toBeCloseTo(0.4);
  });
});
