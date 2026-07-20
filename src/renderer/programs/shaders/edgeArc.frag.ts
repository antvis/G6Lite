export const fragmentShader = `
precision mediump float;
uniform bool u_picking;
varying vec3 v_color;
varying float v_edgePos;
varying float v_dashCycle;
varying float v_opacity;
void main() {
  // Keep the full thick stroke pickable, including visual dash gaps.
  if (!u_picking && v_dashCycle > 0.0) {
    float half_cycle = v_dashCycle * 0.5;
    if (mod(v_edgePos, v_dashCycle) > half_cycle) discard;
  }
  gl_FragColor = vec4(v_color, v_opacity);
}
`;
