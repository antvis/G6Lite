import { describe, expect, it, vi } from 'vitest';
import type { GLContext } from '@src/renderer/gl.js';
import { WebGLContextManager } from '@src/renderer/webglContext.js';

interface GLStubOptions {
  pointSize?: number;
  maxTextureSize?: number;
  maxViewport?: [number, number];
  maxVertexAttributes?: number;
  extensions?: Set<string>;
}

function makeGLStub(options: GLStubOptions = {}): GLContext {
  const enums = {
    ALIASED_POINT_SIZE_RANGE: 1,
    MAX_TEXTURE_SIZE: 2,
    MAX_VIEWPORT_DIMS: 3,
    MAX_VERTEX_ATTRIBS: 4,
  };
  const overrides: Record<string, unknown> = {
    ...enums,
    getParameter: (parameter: number) => {
      if (parameter === enums.ALIASED_POINT_SIZE_RANGE) return [1, options.pointSize ?? 128];
      if (parameter === enums.MAX_TEXTURE_SIZE) return options.maxTextureSize ?? 8192;
      if (parameter === enums.MAX_VIEWPORT_DIMS) return options.maxViewport ?? [4096, 2048];
      if (parameter === enums.MAX_VERTEX_ATTRIBS) return options.maxVertexAttributes ?? 16;
      return undefined;
    },
    getExtension: (name: string) => (options.extensions?.has(name) ? {} : null),
  };
  return new Proxy(overrides, {
    get(target, property: string) {
      if (property in target) return target[property];
      if (/^[A-Z0-9_]+$/.test(property)) return 1;
      return () => undefined;
    },
  }) as unknown as GLContext;
}

function makeCanvas(contexts: { webgl2?: GLContext | null; webgl?: GLContext | null }): {
  canvas: HTMLCanvasElement;
  getContext: ReturnType<typeof vi.fn>;
} {
  const canvas = document.createElement('canvas');
  const getContext = vi.fn((kind: string) => contexts[kind as keyof typeof contexts] ?? null);
  (canvas as unknown as { getContext: typeof getContext }).getContext = getContext;
  return { canvas, getContext };
}

describe('WebGLContextManager', () => {
  it('prefers WebGL 2 and records native capabilities', () => {
    const gl = makeGLStub({ pointSize: 256, maxTextureSize: 16384 });
    const { canvas, getContext } = makeCanvas({ webgl2: gl, webgl: makeGLStub() });

    const contextManager = new WebGLContextManager(canvas);

    expect(contextManager.version).toBe(2);
    expect(contextManager.gl).toBe(gl);
    expect(getContext).toHaveBeenCalledTimes(1);
    expect(getContext).toHaveBeenCalledWith('webgl2', { alpha: false, antialias: true });
    expect(contextManager.capabilities).toMatchObject({
      version: 2,
      maxPointSize: 256,
      maxTextureSize: 16384,
      maxViewportDimensions: [4096, 2048],
      maxVertexAttributes: 16,
      supportsInstancing: true,
      supportsStandardDerivatives: true,
    });
  });

  it('falls back to WebGL 1 and detects extension-backed capabilities', () => {
    const gl = makeGLStub({ extensions: new Set(['ANGLE_instanced_arrays']) });
    const { canvas, getContext } = makeCanvas({ webgl2: null, webgl: gl });

    const contextManager = new WebGLContextManager(canvas);

    expect(contextManager.version).toBe(1);
    expect(getContext.mock.calls.map((call) => call[0])).toEqual(['webgl2', 'webgl']);
    expect(contextManager.capabilities.supportsInstancing).toBe(true);
    expect(contextManager.capabilities.supportsStandardDerivatives).toBe(false);
  });

  it('throws after WebGL 2 and WebGL 1 both fail without requesting experimental-webgl', () => {
    const { canvas, getContext } = makeCanvas({ webgl2: null, webgl: null });

    expect(() => new WebGLContextManager(canvas)).toThrow(/tried WebGL 2 and WebGL 1/);
    expect(getContext.mock.calls.map((call) => call[0])).toEqual(['webgl2', 'webgl']);
  });

  it('prevents context loss, refreshes capabilities on restore, and removes listeners on destroy', () => {
    let pointSize = 64;
    const gl = makeGLStub();
    gl.getParameter = vi.fn((parameter: number) => {
      if (parameter === gl.ALIASED_POINT_SIZE_RANGE) return [1, pointSize];
      if (parameter === gl.MAX_TEXTURE_SIZE) return 4096;
      if (parameter === gl.MAX_VIEWPORT_DIMS) return [4096, 4096];
      if (parameter === gl.MAX_VERTEX_ATTRIBS) return 8;
      return undefined;
    });
    const { canvas } = makeCanvas({ webgl2: gl });
    const onLost = vi.fn();
    const onRestored = vi.fn();
    const contextManager = new WebGLContextManager(canvas, { onLost, onRestored });

    const lost = new Event('webglcontextlost', { cancelable: true });
    canvas.dispatchEvent(lost);
    expect(lost.defaultPrevented).toBe(true);
    expect(contextManager.state).toBe('lost');
    expect(onLost).toHaveBeenCalledTimes(1);

    pointSize = 192;
    canvas.dispatchEvent(new Event('webglcontextrestored'));
    expect(contextManager.state).toBe('active');
    expect(contextManager.capabilities.maxPointSize).toBe(192);
    expect(onRestored).toHaveBeenCalledTimes(1);

    contextManager.destroy();
    const lostAfterDestroy = new Event('webglcontextlost', { cancelable: true });
    canvas.dispatchEvent(lostAfterDestroy);
    expect(lostAfterDestroy.defaultPrevented).toBe(false);
    expect(onLost).toHaveBeenCalledTimes(1);
  });
});
