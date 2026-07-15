export const vertexShader = `
attribute vec2 a_position;
attribute vec3 a_color;
attribute vec3 a_pickingColor;
attribute float a_opacity;
uniform vec2 u_translate;
uniform float u_scale;
uniform vec2 u_resolution;
uniform bool u_picking;
varying vec3 v_color;
varying float v_opacity;
void main() {
  vec2 p = (a_position + u_translate) * u_scale;
  vec2 ndc = vec2(p.x * 2.0 / u_resolution.x - 1.0, 1.0 - p.y * 2.0 / u_resolution.y);
  gl_Position = vec4(ndc, 0.0, 1.0);
  v_color = u_picking ? a_pickingColor : a_color;
  v_opacity = u_picking ? 1.0 : a_opacity;
}
`;
