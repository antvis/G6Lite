/**
 * WebGL context negotiation, capability discovery, and loss/restoration
 * lifecycle management.
 */

import type { GLContext, GLVersion } from './gl';

export type WebGLContextState = 'active' | 'lost' | 'restoring' | 'failed' | 'destroyed';

export interface GLCapabilities {
  version: GLVersion;
  maxPointSize: number;
  maxTextureSize: number;
  maxViewportDimensions: [number, number];
  maxVertexAttributes: number;
  supportsInstancing: boolean;
  supportsStandardDerivatives: boolean;
}

export interface WebGLContextInfo {
  gl: GLContext;
  version: GLVersion;
  capabilities: GLCapabilities;
}

interface WebGLContextCallbacks {
  onLost?: () => void;
  onRestored?: (info: WebGLContextInfo) => void;
  onRestoreFailed?: (error: unknown) => void;
}

const CONTEXT_ATTRIBUTES: WebGLContextAttributes = {
  alpha: false,
  antialias: true,
};

function positiveNumber(value: unknown, fallback: number): number {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function readCapabilities(gl: GLContext, version: GLVersion): GLCapabilities {
  const pointSizeRange = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as
    ArrayLike<number> | null | undefined;
  const viewportDimensions = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as
    ArrayLike<number> | null | undefined;

  return {
    version,
    maxPointSize: positiveNumber(pointSizeRange?.[1], 64),
    maxTextureSize: positiveNumber(gl.getParameter(gl.MAX_TEXTURE_SIZE), 4096),
    maxViewportDimensions: [
      positiveNumber(viewportDimensions?.[0], 4096),
      positiveNumber(viewportDimensions?.[1], 4096),
    ],
    maxVertexAttributes: positiveNumber(gl.getParameter(gl.MAX_VERTEX_ATTRIBS), 8),
    supportsInstancing: version === 2 || Boolean(gl.getExtension('ANGLE_instanced_arrays')),
    supportsStandardDerivatives:
      version === 2 || Boolean(gl.getExtension('OES_standard_derivatives')),
  };
}

function createContext(canvas: HTMLCanvasElement): { gl: GLContext; version: GLVersion } {
  const webgl2 = canvas.getContext('webgl2', CONTEXT_ATTRIBUTES);
  if (webgl2) return { gl: webgl2, version: 2 };

  const webgl1 = canvas.getContext('webgl', CONTEXT_ATTRIBUTES);
  if (webgl1) return { gl: webgl1, version: 1 };

  throw new Error('WebGL not supported (tried WebGL 2 and WebGL 1)');
}

export class WebGLContextManager {
  readonly gl: GLContext;
  readonly version: GLVersion;
  capabilities: GLCapabilities;
  state: WebGLContextState = 'active';

  private readonly canvas: HTMLCanvasElement;
  private readonly callbacks: WebGLContextCallbacks;

  constructor(canvas: HTMLCanvasElement, callbacks: WebGLContextCallbacks = {}) {
    const { gl, version } = createContext(canvas);
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.gl = gl;
    this.version = version;
    this.capabilities = readCapabilities(gl, version);
    canvas.addEventListener('webglcontextlost', this.handleContextLost);
    canvas.addEventListener('webglcontextrestored', this.handleContextRestored);
  }

  private readonly handleContextLost = (event: Event): void => {
    if (this.state === 'destroyed') return;
    event.preventDefault();
    this.state = 'lost';
    this.callbacks.onLost?.();
  };

  private readonly handleContextRestored = (): void => {
    if (this.state === 'destroyed') return;
    this.state = 'restoring';
    try {
      this.capabilities = readCapabilities(this.gl, this.version);
      this.callbacks.onRestored?.(this.info);
      this.state = 'active';
    } catch (error) {
      this.state = 'failed';
      this.callbacks.onRestoreFailed?.(error);
    }
  };

  get info(): WebGLContextInfo {
    return {
      gl: this.gl,
      version: this.version,
      capabilities: this.capabilities,
    };
  }

  get isActive(): boolean {
    return this.state === 'active';
  }

  destroy(): void {
    if (this.state === 'destroyed') return;
    this.state = 'destroyed';
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);
  }
}
