import { describe, expect, it, vi } from 'vitest';
import type { GLContext } from '@src/renderer/gl.js';
import { PickingManager } from '@src/renderer/picking.js';
import { createRegl } from '@src/renderer/regl.js';
import type { GLCapabilities } from '@src/renderer/webglContext.js';

const capabilities: GLCapabilities = {
  version: 2,
  maxPointSize: 64,
  maxTextureSize: 4096,
  maxViewportDimensions: [4096, 4096],
  maxVertexAttributes: 16,
  supportsInstancing: true,
  supportsStandardDerivatives: true,
};

function makeGLStub(overrides: Record<string, unknown> = {}): GLContext {
  const defaults: Record<string, unknown> = {
    FRAMEBUFFER: 1,
    FRAMEBUFFER_COMPLETE: 2,
    TEXTURE_2D: 3,
    COLOR_ATTACHMENT0: 4,
    RGBA: 5,
    UNSIGNED_BYTE: 6,
    TEXTURE_MIN_FILTER: 7,
    TEXTURE_MAG_FILTER: 8,
    TEXTURE_WRAP_S: 9,
    TEXTURE_WRAP_T: 10,
    NEAREST: 11,
    CLAMP_TO_EDGE: 12,
    COLOR_BUFFER_BIT: 13,
    createFramebuffer: vi.fn(() => ({})),
    createTexture: vi.fn(() => ({})),
    checkFramebufferStatus: vi.fn(() => 2),
    deleteFramebuffer: vi.fn(),
    deleteTexture: vi.fn(),
    createRenderbuffer: vi.fn(() => ({})),
    bindFramebuffer: vi.fn(),
    bindTexture: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
    framebufferTexture2D: vi.fn(),
    viewport: vi.fn(),
    clearColor: vi.fn(),
    clear: vi.fn(),
    readPixels: vi.fn(),
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

describe('PickingManager', () => {
  it('uses a validated color-only framebuffer', () => {
    const createRenderbuffer = vi.fn(() => ({}));
    const checkFramebufferStatus = vi.fn(() => 2);
    const gl = makeGLStub({ createRenderbuffer, checkFramebufferStatus });
    const picking = new PickingManager(createRegl(gl), capabilities);

    expect(picking.resize(800, 600)).toBe(true);
    expect(checkFramebufferStatus).toHaveBeenCalledWith(gl.FRAMEBUFFER);
    expect(createRenderbuffer).not.toHaveBeenCalled();
    expect(picking.begin()).not.toBeNull();
    expect(gl.clear).toHaveBeenCalledWith(gl.COLOR_BUFFER_BIT);
  });

  it('falls back once for an incomplete framebuffer and retries after resize or restore', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const createFramebuffer = vi.fn(() => ({}));
    const status = vi.fn(() => 999);
    const gl = makeGLStub({ createFramebuffer, checkFramebufferStatus: status });
    const picking = new PickingManager(createRegl(gl), capabilities);

    expect(picking.resize(800, 600)).toBe(false);
    expect(picking.isAvailable).toBe(false);
    expect(picking.resize(800, 600)).toBe(false);
    expect(createFramebuffer).toHaveBeenCalledTimes(1);

    expect(picking.resize(1000, 600)).toBe(false);
    expect(createFramebuffer).toHaveBeenCalledTimes(2);

    picking.restore(capabilities);
    expect(picking.resize(800, 600)).toBe(false);
    expect(createFramebuffer).toHaveBeenCalledTimes(3);
    expect(warning).toHaveBeenCalledTimes(3);
    warning.mockRestore();
  });

  it('marks GPU picking unavailable when readPixels throws', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const gl = makeGLStub({
      readPixels: vi.fn(() => {
        throw new Error('driver readback failure');
      }),
    });
    const picking = new PickingManager(createRegl(gl), capabilities);
    picking.resize(800, 600);

    expect(picking.pickAt(10, 10, 800, 600)).toBeNull();
    expect(picking.isAvailable).toBe(false);
    expect(warning).toHaveBeenCalledTimes(1);
    warning.mockRestore();
  });
});
