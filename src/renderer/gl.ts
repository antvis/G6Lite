/**
 * WebGL context and program creation.
 */

export type GLContext = WebGLRenderingContext | WebGL2RenderingContext;
export type GLVersion = 1 | 2;

function numberedSource(source: string): string {
  return source
    .split('\n')
    .map((line, index) => `${index + 1}: ${line}`)
    .join('\n');
}

function compileShader(
  gl: GLContext,
  type: number,
  source: string,
  stage: 'vertex' | 'fragment',
  programName: string,
  version: GLVersion,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error(`Unable to create WebGL shader (${programName}, ${stage}, WebGL ${version})`);
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? '';
    gl.deleteShader(shader);
    throw new Error(
      `Shader compile failed (${programName}, ${stage}, WebGL ${version}): ${log}\n${numberedSource(source)}`,
    );
  }
  return shader;
}

export function createProgram(
  gl: GLContext,
  vertSource: string,
  fragSource: string,
  programName = 'Program',
  version: GLVersion = 1,
): WebGLProgram {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSource, 'vertex', programName, version);
  let frag: WebGLShader;
  try {
    frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSource, 'fragment', programName, version);
  } catch (error) {
    gl.deleteShader(vert);
    throw error;
  }
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    throw new Error(`Unable to create WebGL program (${programName}, WebGL ${version})`);
  }
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? '';
    gl.deleteProgram(program);
    throw new Error(`Program link failed (${programName}, WebGL ${version}): ${log}`);
  }
  return program;
}

/** @deprecated Renderer context creation is managed by WebGLContextManager. */
export function getGL(canvas: HTMLCanvasElement): GLContext {
  const attributes: WebGLContextAttributes = { alpha: false, antialias: true };
  const gl = canvas.getContext('webgl2', attributes) ?? canvas.getContext('webgl', attributes);
  if (!gl) throw new Error('WebGL not supported (tried WebGL 2 and WebGL 1)');
  return gl;
}
