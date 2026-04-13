export const vertexShader = `
attribute vec2 a_position;
attribute vec3 a_color;
attribute vec3 a_pickingColor;
uniform vec2 u_translate;
uniform float u_scale;
uniform vec2 u_resolution;
varying vec3 v_color;
varying vec3 v_pickingColor;
void main() {
  vec2 p = (a_position + u_translate) * u_scale;
  vec2 ndc = vec2(p.x * 2.0 / u_resolution.x - 1.0, 1.0 - p.y * 2.0 / u_resolution.y);
  gl_Position = vec4(ndc, 0.0, 1.0);
  v_color = a_color;
  v_pickingColor = a_pickingColor;
}
`;
