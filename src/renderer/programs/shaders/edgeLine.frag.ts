export const fragmentShader = `
precision mediump float;
uniform bool u_picking;
varying vec3 v_color;
varying float v_opacity;
varying vec3 v_pickingColor;
void main() {
  if (u_picking) {
    gl_FragColor = vec4(v_pickingColor, 1.0);
  } else {
    gl_FragColor = vec4(v_color, v_opacity);
  }
}
`;
