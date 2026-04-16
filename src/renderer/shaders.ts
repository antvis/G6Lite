/**
 * WebGL 1 shaders for nodes (points) and edges (lines).
 */

export const nodeVertex = `
attribute vec2 a_pos;
attribute float a_size;
attribute vec3 a_color;
uniform vec2 u_translate;
uniform float u_scale;
uniform vec2 u_resolution;
varying vec3 v_color;
void main() {
  vec2 p = (a_pos + u_translate) * u_scale;
  vec2 ndc = vec2(p.x * 2.0 / u_resolution.x - 1.0, 1.0 - p.y * 2.0 / u_resolution.y);
  gl_Position = vec4(ndc, 0.0, 1.0);
  gl_PointSize = a_size * u_scale;
  v_color = a_color;
}
`;

export const nodeFragment = `
precision mediump float;
varying vec3 v_color;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  if (dot(c, c) > 0.25) discard;
  gl_FragColor = vec4(v_color, 1.0);
}
`;

export const lineVertex = `
attribute vec2 a_pos;
uniform vec2 u_translate;
uniform float u_scale;
uniform vec2 u_resolution;
void main() {
  vec2 p = (a_pos + u_translate) * u_scale;
  vec2 ndc = vec2(p.x * 2.0 / u_resolution.x - 1.0, 1.0 - p.y * 2.0 / u_resolution.y);
  gl_Position = vec4(ndc, 0.0, 1.0);
}
`;

export const lineFragment = `
precision mediump float;
uniform vec3 u_color;
void main() {
  gl_FragColor = vec4(u_color, 1.0);
}
`;
