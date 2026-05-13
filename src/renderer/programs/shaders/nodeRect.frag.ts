export const fragmentShader = `
precision highp float;
uniform bool u_picking;
varying vec3 v_color;
varying vec3 v_pickingColor;
varying vec3 v_strokeColor;
varying vec2 v_halfSize;
varying float v_strokeWidth;
varying float v_opacity;
varying float v_haloWidth;
varying float v_borderRadius;
varying vec2 v_pixelCoord;

float roundedRectSDF(vec2 p, vec2 halfSize, float radius) {
  vec2 d = abs(p) - halfSize + radius;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;
}

void main() {
  float r = min(v_borderRadius, min(v_halfSize.x, v_halfSize.y));
  float dist = roundedRectSDF(v_pixelCoord, v_halfSize, r);
  float aa = 0.8; // anti-aliasing width in pixels

  if (u_picking) {
    if (dist > 0.0) discard;
    gl_FragColor = vec4(v_pickingColor, 1.0);
    return;
  }

  // Halo region
  if (dist > 0.0) {
    if (v_haloWidth <= 0.0 || dist > v_haloWidth + aa) discard;
    float haloAlpha = 1.0 - smoothstep(0.0, v_haloWidth, dist);
    haloAlpha = haloAlpha * 0.25;
    gl_FragColor = vec4(v_color, haloAlpha * v_opacity);
    return;
  }

  // Smooth outer edge
  float outerAlpha = 1.0 - smoothstep(-aa, aa, dist);

  // Stroke region
  if (v_strokeWidth > 0.0) {
    float strokeMix = smoothstep(-v_strokeWidth - aa, -v_strokeWidth + aa, dist);
    vec3 col = mix(v_color, v_strokeColor, strokeMix);
    gl_FragColor = vec4(col, v_opacity * outerAlpha);
    return;
  }

  // Fill
  gl_FragColor = vec4(v_color, v_opacity * outerAlpha);
}
`;
