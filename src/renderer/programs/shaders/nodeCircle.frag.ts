export const fragmentShader = `
precision mediump float;
uniform bool u_picking;
varying vec3 v_color;
varying vec3 v_pickingColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  if (dot(c, c) > 0.25) discard;
  if (u_picking) {
    gl_FragColor = vec4(v_pickingColor, 1.0);
  } else {
    gl_FragColor = vec4(v_color, 1.0);
  }
}
`;
