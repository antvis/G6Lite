/**
 * Abstract base class for WebGL programs.
 * Each program encapsulates shaders, buffer management, and draw calls.
 * Supports both normal rendering and picking mode (via u_picking uniform).
 */

import type { Camera } from '../camera';
import type { Regl, ReglBuffer, ReglFramebuffer } from '../regl';

export interface RenderParams {
  width: number;
  height: number;
  camera: Camera;
  picking?: boolean;
  framebuffer?: ReglFramebuffer | null;
  viewportWidth?: number;
  viewportHeight?: number;
}

export interface AttributeLayout {
  name: string;
  size: number; // components (1, 2, 3, or 4)
}

type Primitive = 'points' | 'lines' | 'triangles' | 'triangle strip';

interface ProgramDrawProps extends RenderParams {
  count: number;
  offset: number;
}

type DrawCommand = (props: ProgramDrawProps) => void;

export abstract class Program {
  protected regl: Regl;
  protected buffer!: ReglBuffer;
  protected array: Float32Array = new Float32Array(0);
  protected itemCount = 0;
  private attributes!: Record<string, { buffer: ReglBuffer; stride: number; offset: number }>;
  private normalDrawCommand!: DrawCommand;
  private pickingDrawCommand: DrawCommand | null = null;
  private readonly translateUniform = new Float32Array(2);
  private readonly resolutionUniform = new Float32Array(2);
  private readonly drawProps: ProgramDrawProps = {
    width: 0,
    height: 0,
    camera: { x: 0, y: 0, zoom: 1 },
    count: 0,
    offset: 0,
  };
  private gpuAvailable = false;
  private gpuByteLength = 0;
  private dirtyItemMarks: Uint8Array = new Uint8Array(0);
  private dirtyItemIndices: number[] = [];

  constructor(regl: Regl) {
    this.regl = regl;
    this.createGPUResources();
  }

  private createGPUResources(): void {
    this.buffer = this.regl.buffer({ length: 0, type: 'float', usage: 'static' });
    this.attributes = {};
    const stride = this.getFloatsPerVertex() * 4;
    let offset = 0;
    for (const attribute of this.getAttributeLayout()) {
      this.attributes[attribute.name] = { buffer: this.buffer, stride, offset };
      offset += attribute.size * 4;
    }

    this.normalDrawCommand = this.createDrawCommand(false);
    this.gpuAvailable = true;
  }

  private createDrawCommand(picking: boolean): DrawCommand {
    const config = {
      vert: this.getVertexShader(),
      frag: this.getFragmentShader(),
      attributes: this.attributes,
      uniforms: {
        u_translate: () => this.translateUniform,
        u_scale: (_context: unknown, props: ProgramDrawProps) => props.camera.zoom,
        u_resolution: () => this.resolutionUniform,
        u_picking: picking,
        u_pointScale: picking
          ? (_context: unknown, props: ProgramDrawProps) =>
              Math.min(
                (props.viewportWidth ?? props.width) / props.width,
                (props.viewportHeight ?? props.height) / props.height,
              )
          : 1,
      },
      primitive: this.getDrawMethod(),
      count: (_context: unknown, props: ProgramDrawProps) => props.count,
      offset: (_context: unknown, props: ProgramDrawProps) => props.offset,
      framebuffer: picking
        ? (_context: unknown, props: ProgramDrawProps) => props.framebuffer ?? null
        : null,
      viewport: {
        x: 0,
        y: 0,
        width: (_context: unknown, props: ProgramDrawProps) =>
          picking ? (props.viewportWidth ?? props.width) : props.width,
        height: (_context: unknown, props: ProgramDrawProps) =>
          picking ? (props.viewportHeight ?? props.height) : props.height,
      },
      depth: { enable: false },
      blend: {
        enable: !picking,
        func: { src: 'src alpha', dst: 'one minus src alpha' },
      },
    };
    return this.regl(config as never) as unknown as DrawCommand;
  }

  private getPickingDrawCommand(): DrawCommand {
    if (!this.pickingDrawCommand) {
      this.pickingDrawCommand = this.createDrawCommand(true);
    }
    return this.pickingDrawCommand;
  }

  private draw(params: RenderParams, offset: number, count: number): void {
    const props = this.drawProps;
    props.width = params.width;
    props.height = params.height;
    props.camera = params.camera;
    props.picking = params.picking;
    props.framebuffer = params.framebuffer;
    props.viewportWidth = params.viewportWidth;
    props.viewportHeight = params.viewportHeight;
    props.offset = offset;
    props.count = count;
    this.translateUniform[0] = params.camera.x;
    this.translateUniform[1] = params.camera.y;
    this.resolutionUniform[0] = params.width;
    this.resolutionUniform[1] = params.height;

    if (params.picking) this.getPickingDrawCommand()(props);
    else this.normalDrawCommand(props);
  }

  abstract getVertexShader(): string;
  abstract getFragmentShader(): string;
  abstract getFloatsPerVertex(): number;
  abstract getVerticesPerItem(): number;
  abstract getDrawMethod(): Primitive;
  abstract getAttributeLayout(): AttributeLayout[];

  reallocate(count: number): void {
    this.itemCount = count;
    this.ensureDirtyItemCapacity(count);
    const needed = count * this.getVerticesPerItem() * this.getFloatsPerVertex();
    if (this.array.length < needed) {
      // Exponential growth to reduce reallocation frequency.
      // Double small arrays; grow large arrays by 25% to bound CPU-side slack.
      const newCapacity = needed < 1000 ? needed * 2 : Math.floor(needed * 1.25);
      const newArray = new Float32Array(newCapacity);
      // Preserve existing data for incremental processing
      if (this.array.length > 0) {
        newArray.set(this.array);
      }
      this.array = newArray;
    }
  }

  setItemCount(count: number): void {
    const normalized = Math.max(0, count);
    this.ensureDirtyItemCapacity(normalized);
    const needed = normalized * this.getVerticesPerItem() * this.getFloatsPerVertex();
    if (this.array.length < needed) {
      this.reallocate(normalized);
      return;
    }
    this.itemCount = normalized;
  }

  /**
   * Reclaim CPU-side slack after a full rebuild. The backing Float32Array is a
   * permanent CPU mirror of the GPU buffer; after a full process() it can hold
   * up to 25-100% slack from exponential growth that is never otherwise freed.
   * Only shrinks when slack is large and worth reclaiming, to avoid realloc
   * churn on small or frequently-updated graphs. Safe to call after process():
   * patch/incremental paths either keep the length or call reallocate() to grow.
   */
  shrinkToFit(): void {
    const usedFloats = this.itemCount * this.getVerticesPerItem() * this.getFloatsPerVertex();
    if (usedFloats === 0) {
      if (this.array.length > 0) this.array = new Float32Array(0);
      return;
    }
    if (this.array.length > usedFloats * 1.5 && this.array.length - usedFloats > 4096) {
      this.array = this.array.slice(0, usedFloats);
    }
  }

  upload(): void {
    if (!this.gpuAvailable) return;
    const fpv = this.getFloatsPerVertex();
    const vpn = this.getVerticesPerItem();
    const usedFloats = this.itemCount * vpn * fpv;
    if (usedFloats > 0) {
      const usedBytes = usedFloats * 4;
      this.buffer({ length: usedBytes, type: 'float', usage: 'static' });
      this.buffer.subdata(this.array.subarray(0, usedFloats), 0);
      this.gpuByteLength = usedBytes;
    } else {
      this.buffer({ length: 0, type: 'float', usage: 'static' });
      this.gpuByteLength = 0;
    }
    this.clearDirtyItems();
  }

  private ensureDirtyItemCapacity(count: number): void {
    if (this.dirtyItemMarks.length >= count) return;
    const marks = new Uint8Array(count);
    marks.set(this.dirtyItemMarks);
    this.dirtyItemMarks = marks;
  }

  /** Mark one logical item for a later range-limited GPU upload. */
  protected markItemDirty(itemIndex: number): void {
    if (itemIndex < 0 || itemIndex >= this.itemCount) return;
    this.ensureDirtyItemCapacity(this.itemCount);
    if (this.dirtyItemMarks[itemIndex] !== 0) return;
    this.dirtyItemMarks[itemIndex] = 1;
    this.dirtyItemIndices.push(itemIndex);
  }

  private clearDirtyItems(): void {
    for (const itemIndex of this.dirtyItemIndices) this.dirtyItemMarks[itemIndex] = 0;
    this.dirtyItemIndices.length = 0;
  }

  render(params: RenderParams): void {
    if (!this.gpuAvailable || this.itemCount <= 0) return;
    this.draw(params, 0, this.itemCount * this.getVerticesPerItem());
  }

  /**
   * Render a subset of items. Used for viewport culling.
   * @param firstItem - Index of first item to render
   * @param itemCount - Number of items to render
   */
  renderRange(params: RenderParams, firstItem: number, itemCount: number): void {
    if (!this.gpuAvailable || itemCount <= 0) return;
    this.draw(params, firstItem * this.getVerticesPerItem(), itemCount * this.getVerticesPerItem());
  }

  /**
   * Find the float offset of a named attribute within one vertex.
   * Returns -1 if the attribute is not found.
   */
  private findAttributeOffset(name: string): number {
    let off = 0;
    for (const attr of this.getAttributeLayout()) {
      if (attr.name === name) return off;
      off += attr.size;
    }
    return -1;
  }

  /**
   * Patch position/center for a single item. Writes x,y to the first
   * position-like attribute (a_position or a_center) for all vertices.
   * Used for incremental node position updates.
   */
  patchItemPosition(itemIndex: number, x: number, y: number): void {
    const fpv = this.getFloatsPerVertex();
    const vpn = this.getVerticesPerItem();
    const posOffset =
      this.findAttributeOffset('a_position') >= 0
        ? this.findAttributeOffset('a_position')
        : this.findAttributeOffset('a_center');
    if (posOffset < 0) return;

    const baseOffset = itemIndex * vpn * fpv;
    for (let v = 0; v < vpn; v++) {
      const o = baseOffset + v * fpv + posOffset;
      this.array[o] = x;
      this.array[o + 1] = y;
    }
    this.markItemDirty(itemIndex);
  }

  /**
   * Patch a named attribute for a single item. Writes values for all vertices.
   * Generic building block for style patching.
   */
  patchAttribute(itemIndex: number, attrName: string, values: number[]): void {
    const fpv = this.getFloatsPerVertex();
    const vpn = this.getVerticesPerItem();
    const attrOffset = this.findAttributeOffset(attrName);
    if (attrOffset < 0) return;

    const baseOffset = itemIndex * vpn * fpv;
    for (let v = 0; v < vpn; v++) {
      const o = baseOffset + v * fpv + attrOffset;
      for (let i = 0; i < values.length; i++) {
        this.array[o + i] = values[i];
      }
    }
    this.markItemDirty(itemIndex);
  }

  /**
   * Patch color floats for a single item in the buffer without full reprocess.
   * Finds the color attribute offset from the layout, writes color for all vertices of the item.
   */
  patchItemColor(itemIndex: number, color: [number, number, number]): void {
    this.patchAttribute(itemIndex, 'a_color', color);
  }

  /** Upload only dirty logical items after patching. */
  reupload(): void {
    if (!this.gpuAvailable) return;
    const itemFloats = this.getVerticesPerItem() * this.getFloatsPerVertex();
    const usedBytes = this.itemCount * itemFloats * 4;
    if (usedBytes !== this.gpuByteLength) {
      this.upload();
      return;
    }
    if (this.dirtyItemIndices.length === 0) return;

    this.dirtyItemIndices.sort((a, b) => a - b);
    let rangeStart = this.dirtyItemIndices[0];
    let rangeEnd = rangeStart + 1;
    for (let i = 1; i <= this.dirtyItemIndices.length; i++) {
      const itemIndex = this.dirtyItemIndices[i];
      if (i < this.dirtyItemIndices.length && itemIndex === rangeEnd) {
        rangeEnd++;
        continue;
      }

      const startFloat = rangeStart * itemFloats;
      const endFloat = rangeEnd * itemFloats;
      this.buffer.subdata(this.array.subarray(startFloat, endFloat), startFloat * 4);
      if (i < this.dirtyItemIndices.length) {
        rangeStart = itemIndex;
        rangeEnd = itemIndex + 1;
      }
    }
    this.clearDirtyItems();
  }

  /** Expose array for direct reads (e.g., to check current color values). */
  getArray(): Float32Array {
    return this.array;
  }

  /** Stop issuing WebGL calls while the owning context is lost. */
  suspend(): void {
    this.gpuAvailable = false;
  }

  /** Reupload the CPU mirror after regl has restored its GPU resources. */
  restore(): void {
    this.gpuAvailable = true;
    this.gpuByteLength = 0;
    this.upload();
  }

  destroy(): void {
    if (!this.gpuAvailable) return;
    this.buffer.destroy();
    this.gpuAvailable = false;
  }
}
