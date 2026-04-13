/**
 * Framebuffer picking: O(1) hit detection via color-encoded IDs.
 *
 * Each node/edge is assigned a unique index encoded as RGB (24-bit = 16M items).
 * A downscaled off-screen framebuffer renders items with their encoded color.
 * On query, readPixels decodes the color back to an index.
 */

const DOWNSAMPLE = 2; // framebuffer at half resolution

export interface PickingResult {
  type: 'node' | 'edge';
  index: number;
}

export class PickingManager {
  private gl: WebGLRenderingContext;
  private framebuffer: WebGLFramebuffer | null = null;
  private colorTexture: WebGLTexture | null = null;
  private renderbufferDepth: WebGLRenderbuffer | null = null;
  private width = 0;
  private height = 0;
  private nodeCount = 0;
  private pixel = new Uint8Array(4);

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  /** Ensure framebuffer matches canvas size (downscaled). */
  resize(canvasWidth: number, canvasHeight: number): void {
    const w = Math.max(1, (canvasWidth / DOWNSAMPLE) | 0);
    const h = Math.max(1, (canvasHeight / DOWNSAMPLE) | 0);
    if (w === this.width && h === this.height) return;

    this.width = w;
    this.height = h;
    const gl = this.gl;

    // Cleanup previous
    if (this.framebuffer) gl.deleteFramebuffer(this.framebuffer);
    if (this.colorTexture) gl.deleteTexture(this.colorTexture);
    if (this.renderbufferDepth) gl.deleteRenderbuffer(this.renderbufferDepth);

    this.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

    // Color attachment: texture with RGBA/UNSIGNED_BYTE for full 8-bit precision per channel
    this.colorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorTexture, 0);

    // Depth renderbuffer (needed for correct z-order)
    this.renderbufferDepth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbufferDepth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbufferDepth);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }

  /** Set the node count so we know the boundary between node and edge IDs. */
  setNodeCount(count: number): void {
    this.nodeCount = count;
  }

  /** Bind the picking framebuffer for rendering. */
  bind(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  /** Unbind back to the default framebuffer. */
  unbind(canvasWidth: number, canvasHeight: number): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvasWidth, canvasHeight);
  }

  /**
   * Read the picking framebuffer at the given screen coordinates.
   * Returns the identified item or null if nothing is there.
   */
  pickAt(screenX: number, screenY: number, canvasWidth: number, canvasHeight: number): PickingResult | null {
    const gl = this.gl;
    // Convert screen coords to picking framebuffer coords
    const x = (screenX / canvasWidth * this.width) | 0;
    const y = ((1 - screenY / canvasHeight) * this.height) | 0; // flip Y

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.pixel);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const [r, g, b, a] = this.pixel;
    if (a === 0) return null; // background (cleared to alpha=0)

    const id = decodeId(r, g, b);
    if (id < 0) return null;

    if (id < this.nodeCount) {
      return { type: 'node', index: id };
    }
    return { type: 'edge', index: id - this.nodeCount };
  }

  destroy(): void {
    const gl = this.gl;
    if (this.framebuffer) gl.deleteFramebuffer(this.framebuffer);
    if (this.colorTexture) gl.deleteTexture(this.colorTexture);
    if (this.renderbufferDepth) gl.deleteRenderbuffer(this.renderbufferDepth);
  }
}

/** Encode a 0-based index into RGB bytes (24-bit). Index 0 maps to (0, 0, 1) to avoid all-zero. */
export function encodeId(index: number): [number, number, number] {
  const id = index + 1; // shift by 1 so index 0 != background (0,0,0)
  return [
    (id >> 16) & 0xFF,
    (id >> 8) & 0xFF,
    id & 0xFF,
  ];
}

/** Decode RGB bytes back to 0-based index. Returns -1 for background. */
function decodeId(r: number, g: number, b: number): number {
  const id = (r << 16) | (g << 8) | b;
  return id - 1; // undo the +1 shift
}
