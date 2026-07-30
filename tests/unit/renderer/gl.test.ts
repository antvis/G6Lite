import { describe, expect, it, vi } from 'vitest';
import { createProgram, getGL } from '@src/renderer/gl.js';
import type { GLContext } from '@src/renderer/gl.js';

function makeGLStub(overrides: Record<string, unknown> = {}): GLContext {
  const defaults: Record<string, unknown> = {
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 2,
    COMPILE_STATUS: 3,
    LINK_STATUS: 4,
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    getShaderInfoLog: vi.fn(() => ''),
    deleteShader: vi.fn(),
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    getProgramInfoLog: vi.fn(() => ''),
    deleteProgram: vi.fn(),
    ...overrides,
  };
  return new Proxy(defaults, {
    get(target, property: string) {
      if (property in target) return target[property];
      if (/^[A-Z0-9_]+$/.test(property)) return 1;
      return () => undefined;
    },
  }) as unknown as GLContext;
}

describe('WebGL helpers', () => {
  it('prefers WebGL 2, falls back to WebGL 1, and reports initialization failure', () => {
    const webgl2 = makeGLStub();
    const webgl1 = makeGLStub();
    const canvas = document.createElement('canvas');
    const getContext = vi.fn((kind: string) => {
      if (kind === 'webgl2') return webgl2;
      if (kind === 'webgl') return webgl1;
      return null;
    });
    (canvas as unknown as { getContext: typeof getContext }).getContext = getContext;

    expect(getGL(canvas)).toBe(webgl2);
    expect(getContext).toHaveBeenCalledTimes(1);

    getContext.mockImplementation((kind: string) => (kind === 'webgl' ? webgl1 : null));
    expect(getGL(canvas)).toBe(webgl1);
    expect(getContext.mock.calls.slice(-2).map((call) => call[0])).toEqual(['webgl2', 'webgl']);

    getContext.mockReturnValue(null);
    expect(() => getGL(canvas)).toThrow(/tried WebGL 2 and WebGL 1/);
  });

  it('reports shader stage, WebGL version, and numbered source on compile failure', () => {
    const gl = makeGLStub({
      getShaderParameter: () => false,
      getShaderInfoLog: () => 'syntax error',
    });

    expect(() => createProgram(gl, 'line one\nline two', 'fragment', 'NodeCircle', 2)).toThrow(
      /NodeCircle, vertex, WebGL 2.*syntax error.*1: line one.*2: line two/s,
    );
  });

  it('cleans up the vertex shader when fragment compilation fails', () => {
    const deleteShader = vi.fn();
    let compileCount = 0;
    const gl = makeGLStub({
      deleteShader,
      getShaderParameter: () => ++compileCount === 1,
      getShaderInfoLog: () => 'fragment error',
    });

    expect(() => createProgram(gl, 'vertex', 'fragment', 'EdgeLine', 1)).toThrow(
      /EdgeLine, fragment, WebGL 1/,
    );
    expect(deleteShader).toHaveBeenCalledTimes(2);
  });

  it('reports program link failures with the Program name and WebGL version', () => {
    const gl = makeGLStub({
      getProgramParameter: () => false,
      getProgramInfoLog: () => 'link mismatch',
    });

    expect(() => createProgram(gl, 'vertex', 'fragment', 'EdgeArc', 2)).toThrow(
      /Program link failed \(EdgeArc, WebGL 2\): link mismatch/,
    );
  });
});
