/**
 * WebGL context and program creation.
 */
function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader) ?? '';
        gl.deleteShader(shader);
        throw new Error(`Shader compile: ${log}`);
    }
    return shader;
}
export function createProgram(gl, vertSource, fragSource) {
    const vert = compileShader(gl, gl.VERTEX_SHADER, vertSource);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSource);
    const program = gl.createProgram();
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
export function getGL(canvas) {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: true });
    if (!gl)
        throw new Error('WebGL not supported');
    return gl;
}
//# sourceMappingURL=gl.js.map