/**
 * WebGL context and program creation.
 */

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create WebGL shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? '';
    gl.deleteShader(shader);
    throw new Error(`Shader compile: ${log}`);
  }
  return shader;
}

export function createProgram(
  gl: WebGLRenderingContext,
  vertSource: string,
  fragSource: string,
): WebGLProgram {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSource);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSource);
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    throw new Error('Unable to create WebGL program');
  }
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? '';
    gl.deleteProgram(program);
    throw new Error(`Program link: ${log}`);
  }
  return program;
}

export function getGL(canvas: HTMLCanvasElement): WebGLRenderingContext {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: true });
  if (!gl) throw new Error('WebGL not supported');
  gl.getExtension('OES_standard_derivatives');
  return gl;
}
