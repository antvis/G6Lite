import { vi } from 'vitest';

type GLStub = WebGLRenderingContext & Record<string, unknown>;

function compileProgram(gl: GLStub, config: Record<string, unknown>): void {
  const vertex = gl.createShader(gl.VERTEX_SHADER);
  const fragment = gl.createShader(gl.FRAGMENT_SHADER);
  if (!vertex || !fragment) throw new Error('Unable to create WebGL shader');
  gl.shaderSource(vertex, String(config.vert ?? ''));
  gl.shaderSource(fragment, String(config.frag ?? ''));
  gl.compileShader(vertex);
  gl.compileShader(fragment);
  if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) throw new Error('Shader compile failed');
  if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) throw new Error('Shader compile failed');
  const program = gl.createProgram();
  if (!program) throw new Error('Unable to create WebGL program');
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Program link failed');
}

/** Small regl-compatible test double backed by the existing WebGL stubs. */
export function createReglMock(gl: GLStub) {
  const commands: ReturnType<typeof vi.fn>[] = [];
  const commandConfigs: Record<string, unknown>[] = [];
  const buffers: Array<
    ReturnType<typeof vi.fn> & {
      subdata: ReturnType<typeof vi.fn>;
      destroy: ReturnType<typeof vi.fn>;
    }
  > = [];

  const regl = vi.fn((config: Record<string, unknown>) => {
    compileProgram(gl, config);
    const command = vi.fn((props: Record<string, unknown>) => {
      const primitive = config.primitive;
      const enumValue =
        primitive === 'points'
          ? gl.POINTS
          : primitive === 'lines'
            ? gl.LINES
            : primitive === 'triangle strip'
              ? gl.TRIANGLE_STRIP
              : gl.TRIANGLES;
      gl.drawArrays(enumValue, Number(props.offset ?? 0), Number(props.count ?? 0));
    });
    commandConfigs.push(config);
    commands.push(command);
    return command;
  }) as ReturnType<typeof vi.fn> & Record<string, unknown>;

  regl.buffer = vi.fn((options?: { length?: number; data?: BufferSource }) => {
    const handle = gl.createBuffer();
    if (!handle) throw new Error('Unable to create WebGL buffer');
    const buffer = vi.fn((next?: { length?: number; data?: BufferSource }) => {
      const value = next?.data ?? next?.length ?? 0;
      gl.bufferData(gl.ARRAY_BUFFER, value, gl.STATIC_DRAW);
      return buffer;
    }) as ReturnType<typeof vi.fn> & {
      subdata: ReturnType<typeof vi.fn>;
      destroy: ReturnType<typeof vi.fn>;
    };
    buffer.subdata = vi.fn((data: BufferSource, offset = 0) => {
      gl.bufferSubData(gl.ARRAY_BUFFER, offset, data);
      return buffer;
    });
    buffer.destroy = vi.fn(() => gl.deleteBuffer(handle));
    buffers.push(buffer);
    if (options) buffer(options);
    return buffer;
  });

  regl.texture = vi.fn((options: { width?: number; height?: number } = {}) => {
    const handle = gl.createTexture();
    if (!handle) throw new Error('Unable to create WebGL texture');
    return {
      width: options.width ?? 1,
      height: options.height ?? 1,
      destroy: vi.fn(() => gl.deleteTexture(handle)),
    };
  });

  regl.framebuffer = vi.fn((options: { color?: { width?: number; height?: number } } = {}) => {
    const handle = gl.createFramebuffer();
    if (!handle) throw new Error('Unable to create WebGL framebuffer');
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE)
      throw new Error(`Framebuffer is incomplete (${status})`);
    return {
      width: options.color?.width ?? 1,
      height: options.color?.height ?? 1,
      destroy: vi.fn(() => gl.deleteFramebuffer(handle)),
    };
  });

  regl.clear = vi.fn(() => gl.clear(gl.COLOR_BUFFER_BIT));
  regl.read = vi.fn(
    (options: { x?: number; y?: number; width?: number; height?: number; data?: Uint8Array }) => {
      const data = options.data ?? new Uint8Array((options.width ?? 1) * (options.height ?? 1) * 4);
      gl.readPixels(
        options.x ?? 0,
        options.y ?? 0,
        options.width ?? 1,
        options.height ?? 1,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        data,
      );
      return data;
    },
  );
  regl.poll = vi.fn();
  regl.destroy = vi.fn();
  regl.on = vi.fn(() => ({ cancel: vi.fn() }));
  regl.hasExtension = vi.fn(() => false);
  regl.limits = {};
  regl.stats = {};
  regl._gl = gl;
  regl.attributes = {};
  regl.__commands = commands;
  regl.__commandConfigs = commandConfigs;
  regl.__buffers = buffers;

  return regl;
}
