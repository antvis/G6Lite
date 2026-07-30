import createREGL from 'regl';
import type { GLContext } from './gl';

export type Regl = ReturnType<typeof createREGL>;
export type ReglBuffer = ReturnType<Regl['buffer']>;
export type ReglFramebuffer = ReturnType<Regl['framebuffer']>;
export type ReglTexture = ReturnType<Regl['texture']>;

/** Create regl around the WebGL2/WebGL1 context selected by G6Lite. */
export function createRegl(gl: GLContext): Regl {
  return createREGL({
    gl: gl as WebGLRenderingContext,
    optionalExtensions: ['ANGLE_instanced_arrays', 'OES_standard_derivatives'],
    profile: false,
  });
}
