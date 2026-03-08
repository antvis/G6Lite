/**
 * WebGL 1 shaders for nodes (points) and edges (lines).
 */
export declare const nodeVertex = "\nattribute vec2 a_pos;\nattribute float a_size;\nattribute vec3 a_color;\nuniform vec2 u_translate;\nuniform float u_scale;\nuniform vec2 u_resolution;\nvarying vec3 v_color;\nvoid main() {\n  vec2 p = (a_pos + u_translate) * u_scale;\n  vec2 ndc = vec2(p.x * 2.0 / u_resolution.x - 1.0, 1.0 - p.y * 2.0 / u_resolution.y);\n  gl_Position = vec4(ndc, 0.0, 1.0);\n  gl_PointSize = a_size * u_scale;\n  v_color = a_color;\n}\n";
export declare const nodeFragment = "\nprecision mediump float;\nvarying vec3 v_color;\nvoid main() {\n  vec2 c = gl_PointCoord - 0.5;\n  if (dot(c, c) > 0.25) discard;\n  gl_FragColor = vec4(v_color, 1.0);\n}\n";
export declare const lineVertex = "\nattribute vec2 a_pos;\nuniform vec2 u_translate;\nuniform float u_scale;\nuniform vec2 u_resolution;\nvoid main() {\n  vec2 p = (a_pos + u_translate) * u_scale;\n  vec2 ndc = vec2(p.x * 2.0 / u_resolution.x - 1.0, 1.0 - p.y * 2.0 / u_resolution.y);\n  gl_Position = vec4(ndc, 0.0, 1.0);\n}\n";
export declare const lineFragment = "\nprecision mediump float;\nuniform vec3 u_color;\nvoid main() {\n  gl_FragColor = vec4(u_color, 1.0);\n}\n";
//# sourceMappingURL=shaders.d.ts.map