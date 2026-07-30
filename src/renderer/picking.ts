/**
 * Framebuffer picking: O(1) hit detection via color-encoded IDs.
 *
 * Each node/edge is assigned a unique index encoded as RGB (24-bit = 16M items).
 * A downscaled color-only framebuffer renders items with their encoded color.
 * On query, readPixels decodes the color back to an index.
 */

import type { Regl, ReglFramebuffer, ReglTexture } from './regl';
import type { GLCapabilities } from './webglContext';

const DOWNSAMPLE = 2; // framebuffer at half resolution
const PICKING_CLEAR_COLOR: [number, number, number, number] = [0, 0, 0, 0];

export interface PickingResult {
  type: 'node' | 'edge';
  index: number;
}

type PickingState = 'uninitialized' | 'ready' | 'failed' | 'suspended' | 'destroyed';

export class PickingManager {
  private regl: Regl;
  private capabilities: GLCapabilities;
  private framebuffer: ReglFramebuffer | null = null;
  private colorTexture: ReglTexture | null = null;
  private width = 0;
  private height = 0;
  private nodeCount = 0;
  private pixel = new Uint8Array(4);
  private state: PickingState = 'uninitialized';

  constructor(regl: Regl, capabilities: GLCapabilities) {
    this.regl = regl;
    this.capabilities = capabilities;
  }

  get isAvailable(): boolean {
    return this.state === 'ready';
  }

  /** Ensure framebuffer matches canvas size (downscaled and device-limited). */
  resize(canvasWidth: number, canvasHeight: number): boolean {
    if (this.state === 'destroyed' || this.state === 'suspended') return false;
    const maxWidth = Math.min(
      this.capabilities.maxTextureSize,
      this.capabilities.maxViewportDimensions[0],
    );
    const maxHeight = Math.min(
      this.capabilities.maxTextureSize,
      this.capabilities.maxViewportDimensions[1],
    );
    const w = Math.min(maxWidth, Math.max(1, (canvasWidth / DOWNSAMPLE) | 0));
    const h = Math.min(maxHeight, Math.max(1, (canvasHeight / DOWNSAMPLE) | 0));
    if (w === this.width && h === this.height) return this.state === 'ready';

    this.releaseResources(true);
    this.state = 'uninitialized';
    this.width = w;
    this.height = h;
    try {
      this.colorTexture = this.regl.texture({
        width: w,
        height: h,
        format: 'rgba',
        type: 'uint8',
        min: 'nearest',
        mag: 'nearest',
        wrap: 'clamp',
      });
      this.framebuffer = this.regl.framebuffer({
        color: this.colorTexture,
        depth: false,
        stencil: false,
      });

      this.state = 'ready';
      return true;
    } catch (error) {
      this.fail('Color picking framebuffer creation failed', error);
      return false;
    }
  }

  /** Set the node count so we know the boundary between node and edge IDs. */
  setNodeCount(count: number): void {
    this.nodeCount = count;
  }

  /** Clear and return the picking target for Program commands. */
  begin(): ReglFramebuffer | null {
    if (!this.isAvailable || !this.framebuffer) return null;
    this.regl.clear({ framebuffer: this.framebuffer, color: PICKING_CLEAR_COLOR });
    return this.framebuffer;
  }

  /**
   * Read the picking framebuffer at the given screen coordinates.
   * Returns the identified item or null if nothing is there or GPU picking failed.
   */
  pickAt(
    screenX: number,
    screenY: number,
    canvasWidth: number,
    canvasHeight: number,
  ): PickingResult | null {
    if (!this.isAvailable || !this.framebuffer || canvasWidth <= 0 || canvasHeight <= 0) {
      return null;
    }
    const x = Math.max(0, Math.min(this.width - 1, ((screenX / canvasWidth) * this.width) | 0));
    const y = Math.max(
      0,
      Math.min(this.height - 1, ((1 - screenY / canvasHeight) * this.height) | 0),
    );

    try {
      this.regl.read({
        framebuffer: this.framebuffer,
        x,
        y,
        width: 1,
        height: 1,
        data: this.pixel,
      });
    } catch (error) {
      this.fail('Color picking readPixels failed', error);
      return null;
    }

    const [r, g, b, a] = this.pixel;
    if (a === 0) return null;

    const id = decodeId(r, g, b);
    if (id < 0) return null;

    if (id < this.nodeCount) {
      return { type: 'node', index: id };
    }
    return { type: 'edge', index: id - this.nodeCount };
  }

  /** Stop WebGL access until the browser restores the owning context. */
  suspend(): void {
    if (this.state !== 'destroyed') this.state = 'suspended';
  }

  /** Resume after regl has restored the framebuffer and texture resources. */
  restore(capabilities: GLCapabilities): void {
    this.capabilities = capabilities;
    this.state = this.framebuffer && this.colorTexture ? 'ready' : 'uninitialized';
  }

  markFailed(message: string, error?: unknown): void {
    this.fail(message, error);
  }

  private fail(message: string, error?: unknown): void {
    if (this.state === 'failed' || this.state === 'destroyed') return;
    this.releaseResources(true);
    this.state = 'failed';
    if (error === undefined) console.warn(`[G6-GL] ${message}; falling back to CPU picking`);
    else console.warn(`[G6-GL] ${message}; falling back to CPU picking`, error);
  }

  private releaseResources(deleteResources: boolean): void {
    if (deleteResources) {
      this.framebuffer?.destroy();
      this.colorTexture?.destroy();
    }
    this.framebuffer = null;
    this.colorTexture = null;
  }

  destroy(): void {
    if (this.state === 'destroyed') return;
    this.releaseResources(true);
    this.state = 'destroyed';
  }

  get viewportWidth(): number {
    return this.width;
  }

  get viewportHeight(): number {
    return this.height;
  }
}

/** Encode a 0-based index into RGB bytes (24-bit). Index 0 maps to (0, 0, 1) to avoid all-zero. */
export function encodeId(index: number): [number, number, number] {
  const id = index + 1; // shift by 1 so index 0 != background (0,0,0)
  return [(id >> 16) & 0xff, (id >> 8) & 0xff, id & 0xff];
}

/** Decode RGB bytes back to 0-based index. Returns -1 for background. */
function decodeId(r: number, g: number, b: number): number {
  const id = (r << 16) | (g << 8) | b;
  return id - 1; // undo the +1 shift
}
