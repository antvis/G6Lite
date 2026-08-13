export const vertexShader = `
precision highp float;
attribute vec2 a_position;
attribute vec3 a_normalSide;
attribute vec4 a_style;
attribute vec3 a_color;
attribute float a_pickingIndex;
attribute float a_hitAreaWidth;
uniform vec2 u_translate;
uniform float u_scale;
uniform vec2 u_resolution;
uniform bool u_picking;
varying vec3 v_color;
varying float v_edgePos;
varying float v_dashCycle;
varying float v_opacity;

vec3 encodePickingColor(float id) {
  id += 1.0;
  return vec3(floor(id / 65536.0), floor(mod(id, 65536.0) / 256.0), mod(id, 256.0)) / 255.0;
}

void main() {
  vec2 centerPx = (a_position + u_translate) * u_scale;
  float width = max(a_style.x, a_hitAreaWidth * float(u_picking));
  vec2 posPx = centerPx + a_normalSide.xy * width * 0.5 * a_normalSide.z;
  gl_Position = vec4(posPx * vec2(2.0, -2.0) / u_resolution + vec2(-1.0, 1.0), 0.0, 1.0);
  v_color = u_picking ? encodePickingColor(a_pickingIndex) : a_color;
  v_edgePos = a_style.z * u_scale;
  v_dashCycle = a_style.y;
  v_opacity = u_picking ? 1.0 : a_style.w;
}
`;
