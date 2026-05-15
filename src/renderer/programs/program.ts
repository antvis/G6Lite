/**
 * Abstract base class for WebGL programs.
 * Each program encapsulates shaders, buffer management, and draw calls.
 * Supports both normal rendering and picking mode (via u_picking uniform).
 */

import { createProgram } from '../gl.js';
import type { Camera } from '../camera.js';

export interface RenderParams {
  width: number;
  height: number;
  camera: Camera;
  picking?: boolean;
}

export interface AttributeLayout {
  name: string;
  size: number; // components (1, 2, 3, or 4)
}

export abstract class Program {
  protected gl: WebGLRenderingContext;
  protected glProgram: WebGLProgram;
  protected buffer: WebGLBuffer;
  protected array: Float32Array = new Float32Array(0);
  protected itemCount = 0;
  private uniforms = new Map<string, WebGLUniformLocation | null>();
  private attributes = new Map<string, number>();

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.glProgram = createProgram(gl, this.getVertexShader(), this.getFragmentShader());
    this.buffer = gl.createBuffer()!;
  }

  abstract getVertexShader(): string;
  abstract getFragmentShader(): string;
  abstract getFloatsPerVertex(): number;
  abstract getVerticesPerItem(): number;
  abstract getDrawMethod(): number;
  abstract getAttributeLayout(): AttributeLayout[];
  abstract setUniforms(params: RenderParams): void;

  protected uniform(name: string): WebGLUniformLocation | null {
    if (!this.uniforms.has(name)) {
      this.uniforms.set(name, this.gl.getUniformLocation(this.glProgram, name));
    }
    return this.uniforms.get(name)!;
  }

  protected attribute(name: string): number {
    if (!this.attributes.has(name)) {
      this.attributes.set(name, this.gl.getAttribLocation(this.glProgram, name));
    }
    return this.attributes.get(name)!;
  }

  reallocate(count: number): void {
    this.itemCount = count;
    const needed = count * this.getVerticesPerItem() * this.getFloatsPerVertex();
    if (this.array.length < needed) {
      // Exponential growth to reduce reallocation frequency
      // Double the capacity or add 50% margin for large arrays
      const newCapacity = needed < 1000 ? needed * 2 : Math.floor(needed * 1.5);
      const newArray = new Float32Array(newCapacity);
      // Preserve existing data for incremental processing
      if (this.array.length > 0) {
        newArray.set(this.array);
      }
      this.array = newArray;
    }
  }

  upload(): void {
    const gl = this.gl;
    const fpv = this.getFloatsPerVertex();
    const vpn = this.getVerticesPerItem();
    const usedFloats = this.itemCount * vpn * fpv;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    if (usedFloats > 0) {
      const usedBytes = usedFloats * 4;
      gl.bufferData(gl.ARRAY_BUFFER, usedBytes, gl.STATIC_DRAW);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.array.subarray(0, usedFloats));
    } else {
      gl.bufferData(gl.ARRAY_BUFFER, 0, gl.STATIC_DRAW);
    }
  }

  render(params: RenderParams): void {
    if (this.itemCount <= 0) return;
    const gl = this.gl;

    gl.useProgram(this.glProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    // Bind attribute pointers
    const layout = this.getAttributeLayout();
    const stride = this.getFloatsPerVertex() * 4;
    let offset = 0;
    for (const attr of layout) {
      const loc = this.attribute(attr.name);
      if (loc >= 0) {
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, attr.size, gl.FLOAT, false, stride, offset);
      }
      offset += attr.size * 4;
    }

    this.setUniforms(params);

    // Set picking uniform
    const pickingLoc = this.uniform('u_picking');
    gl.uniform1i(pickingLoc, params.picking ? 1 : 0);

    const vertexCount = this.itemCount * this.getVerticesPerItem();
    gl.drawArrays(this.getDrawMethod(), 0, vertexCount);
  }

  /**
   * Render a subset of items. Used for viewport culling.
   * @param firstItem - Index of first item to render
   * @param itemCount - Number of items to render
   */
  renderRange(params: RenderParams, firstItem: number, itemCount: number): void {
    if (itemCount <= 0) return;
    const gl = this.gl;

    gl.useProgram(this.glProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    const layout = this.getAttributeLayout();
    const stride = this.getFloatsPerVertex() * 4;
    let offset = 0;
    for (const attr of layout) {
      const loc = this.attribute(attr.name);
      if (loc >= 0) {
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, attr.size, gl.FLOAT, false, stride, offset);
      }
      offset += attr.size * 4;
    }

    this.setUniforms(params);

    const pickingLoc = this.uniform('u_picking');
    gl.uniform1i(pickingLoc, params.picking ? 1 : 0);

    const firstVertex = firstItem * this.getVerticesPerItem();
    const vertexCount = itemCount * this.getVerticesPerItem();
    gl.drawArrays(this.getDrawMethod(), firstVertex, vertexCount);
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
  }

  /**
   * Patch color floats for a single item in the buffer without full reprocess.
   * Finds the color attribute offset from the layout, writes color for all vertices of the item.
   */
  patchItemColor(itemIndex: number, color: [number, number, number]): void {
    this.patchAttribute(itemIndex, 'a_color', color);
  }

  /** Re-upload buffer data to GPU after patching. */
  reupload(): void {
    this.upload();
  }

  /** Expose array for direct reads (e.g., to check current color values). */
  getArray(): Float32Array {
    return this.array;
  }

  destroy(): void {
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteProgram(this.glProgram);
  }
}
