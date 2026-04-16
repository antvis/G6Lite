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
      this.array = new Float32Array(needed);
    }
  }

  upload(): void {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.array, gl.STATIC_DRAW);
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
   * Patch color floats for a single item in the buffer without full reprocess.
   * Finds the color attribute offset from the layout, writes color for all vertices of the item.
   */
  patchItemColor(itemIndex: number, color: [number, number, number]): void {
    const layout = this.getAttributeLayout();
    const fpv = this.getFloatsPerVertex();
    const vpn = this.getVerticesPerItem();

    // Find offset of 'a_color' within one vertex
    let colorOffset = -1;
    let off = 0;
    for (const attr of layout) {
      if (attr.name === 'a_color') { colorOffset = off; break; }
      off += attr.size;
    }
    if (colorOffset < 0) return;

    const baseOffset = itemIndex * vpn * fpv;
    for (let v = 0; v < vpn; v++) {
      const o = baseOffset + v * fpv + colorOffset;
      this.array[o] = color[0];
      this.array[o + 1] = color[1];
      this.array[o + 2] = color[2];
    }
  }

  /** Re-upload buffer data to GPU after patching. */
  reupload(): void {
    this.upload();
  }

  /** Expose array for direct reads (e.g., to check current color values). */
  getArray(): Float32Array { return this.array; }

  destroy(): void {
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteProgram(this.glProgram);
  }
}
