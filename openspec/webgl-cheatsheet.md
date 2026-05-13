# WebGL 图可视化开发速查表

## 一、常用 GLSL 函数速查

### 1.1 几何函数

```glsl
// 向量长度
float len = length(v);

// 归一化（单位向量）
vec2 n = normalize(v);

// 点积（判断方向）
float dotProduct = dot(a, b);

// 叉积（2D 中用于判断左右）
float cross2D = cross(vec3(a, 0), vec3(b, 0)).z;

// 距离
float d = distance(p1, p2);

// 线性插值
vec3 mixed = mix(a, b, t);  // a * (1-t) + b * t

// 步进/平滑步进
float s = step(edge, x);           // x < edge ? 0 : 1
float sm = smoothstep(e0, e1, x);  // Hermite 插值
```

### 1.2 图可视化专用 Shader 代码

#### 圆形节点 (GL_POINTS)
```glsl
// Vertex Shader
attribute vec2 a_position;
attribute float a_size;
attribute vec3 a_color;

uniform vec2 u_camera;
uniform float u_zoom;
uniform vec2 u_resolution;

varying vec3 v_color;

void main() {
  vec2 pos = (a_position + u_camera) * u_zoom;
  vec2 clip = pos / u_resolution * 2.0;
  gl_Position = vec4(clip, 0, 1);
  gl_PointSize = a_size * u_zoom;
  v_color = a_color;
}

// Fragment Shader
precision mediump float;
varying vec3 v_color;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  if (length(coord) > 0.5) discard;
  gl_FragColor = vec4(v_color, 1.0);
}
```

#### 粗边渲染 (TRIANGLES)
```glsl
// Vertex Shader
attribute vec2 a_source;
attribute vec2 a_target;
attribute float a_lineWidth;
attribute float a_posCoef;    // 0 = source, 1 = target
attribute float a_normalCoef; // -1 or 1

uniform vec2 u_camera;
uniform float u_zoom;
uniform vec2 u_resolution;

void main() {
  vec2 line = a_target - a_source;
  vec2 normal = normalize(vec2(-line.y, line.x));

  vec2 pos = mix(a_source, a_target, a_posCoef);
  pos += normal * a_normalCoef * a_lineWidth * 0.5;

  vec2 clip = (pos + u_camera) * u_zoom / u_resolution * 2.0;
  gl_Position = vec4(clip, 0, 1);
}
```

#### SDF 圆形（抗锯齿）
```glsl
float circleSDF(vec2 p, float r) {
  return length(p) - r;
}

void main() {
  vec2 p = gl_PointCoord - vec2(0.5);
  float d = circleSDF(p, 0.5);

  // 平滑边缘
  float alpha = 1.0 - smoothstep(-0.01, 0.01, d);
  if (alpha < 0.01) discard;

  gl_FragColor = vec4(v_color, alpha);
}
```

## 二、WebGL API 速查

### 2.1 Buffer 操作

```javascript
// 创建 Buffer
const buffer = gl.createBuffer();

// 绑定 Buffer
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

// 上传数据（静态）
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

// 上传数据（动态）
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);

// 子区域更新
const offset = 100 * 4; // 字节偏移
gl.bufferSubData(gl.ARRAY_BUFFER, offset, new Float32Array(subData));

// 删除 Buffer
gl.deleteBuffer(buffer);
```

### 2.2 着色器操作

```javascript
// 创建着色器
const vs = gl.createShader(gl.VERTEX_SHADER);
const fs = gl.createShader(gl.FRAGMENT_SHADER);

// 设置源码
gl.shaderSource(vs, vertexSource);
gl.shaderSource(fs, fragmentSource);

// 编译
gl.compileShader(vs);
gl.compileShader(fs);

// 检查编译错误
if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
  console.error(gl.getShaderInfoLog(vs));
}

// 创建 Program
const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);

// 使用 Program
gl.useProgram(program);
```

### 2.3 Attribute 和 Uniform

```javascript
// 获取 Attribute 位置
const aPosition = gl.getAttribLocation(program, 'a_position');

// 启用 Attribute
gl.enableVertexAttribArray(aPosition);

// 设置 Attribute 指针
// (location, size, type, normalize, stride, offset)
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

// 获取 Uniform 位置
const uColor = gl.getUniformLocation(program, 'u_color');

// 设置 Uniform
gl.uniform4f(uColor, 1, 0, 0, 1);
gl.uniform1f(uScale, 2.0);
gl.uniform2f(uTranslate, 100, 100);
gl.uniformMatrix3fv(uMatrix, false, matrix);
```

### 2.4 绘制命令

```javascript
// 清空画布
gl.clearColor(1, 1, 1, 1); // 白色背景
gl.clear(gl.COLOR_BUFFER_BIT);

// 绘制点
gl.drawArrays(gl.POINTS, 0, count);

// 绘制线
gl.drawArrays(gl.LINES, 0, count);      // 每两个顶点一条线
gl.drawArrays(gl.LINE_STRIP, 0, count); // 连续线
gl.drawArrays(gl.LINE_LOOP, 0, count);  // 闭合线

// 绘制三角形
gl.drawArrays(gl.TRIANGLES, 0, count);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, count);
gl.drawArrays(gl.TRIANGLE_FAN, 0, count);

// 启用混合（透明度）
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
```

### 2.5 Framebuffer 操作

```javascript
// 创建纹理
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

// 创建 Framebuffer
const fb = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

// 检查完整性
if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
  console.error('Framebuffer incomplete');
}

// 读取像素
const pixels = new Uint8Array(4);
gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

// 解绑
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
```

## 三、图可视化常用技巧

### 3.1 坐标转换

```javascript
// 图坐标 → 屏幕坐标
function graphToScreen(graphX, graphY, camera, canvas) {
  return {
    x: (graphX + camera.x) * camera.zoom,
    y: (graphY + camera.y) * camera.zoom
  };
}

// 屏幕坐标 → 图坐标
function screenToGraph(screenX, screenY, camera, canvas) {
  return {
    x: screenX / camera.zoom - camera.x,
    y: screenY / camera.zoom - camera.y
  };
}

// 图坐标 → NDC (-1 to 1)
function graphToNDC(graphX, graphY, camera, width, height) {
  const screenX = (graphX + camera.x) * camera.zoom;
  const screenY = (graphY + camera.y) * camera.zoom;
  return {
    x: (screenX / width) * 2 - 1,
    y: 1 - (screenY / height) * 2  // Y 翻转
  };
}
```

### 3.2 视口裁剪

```javascript
// 计算可见区域
function getVisibleBounds(camera, width, height) {
  const halfW = width / 2 / camera.zoom;
  const halfH = height / 2 / camera.zoom;
  return {
    left: -camera.x - halfW,
    right: -camera.x + halfW,
    top: -camera.y - halfH,
    bottom: -camera.y + halfH
  };
}

// 节点是否在视口内
function isNodeVisible(node, bounds, margin = 100) {
  return (
    node.x + margin >= bounds.left &&
    node.x - margin <= bounds.right &&
    node.y + margin >= bounds.top &&
    node.y - margin <= bounds.bottom
  );
}
```

### 3.3 性能优化技巧

```javascript
// 1. 批量绘制（减少 draw call）
// 合并相同样式的节点到一个 buffer

// 2. 使用 TypedArray
const buffer = new Float32Array(size);
// 避免使用普通数组再转换

// 3. 指数增长 buffer 容量
function growBuffer(currentSize, neededSize) {
  return Math.max(currentSize * 2, neededSize);
}

// 4. 延迟上传
let needsUpload = false;
function updateData() {
  needsUpload = true;
}
function draw() {
  if (needsUpload) {
    uploadBuffer();
    needsUpload = false;
  }
  gl.drawArrays(...);
}

// 5. 使用 requestAnimationFrame
function scheduleRender() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      draw();
    });
  }
}
```

## 四、调试技巧

### 4.1 WebGL 错误检查

```javascript
function checkGLError(gl, operation) {
  const error = gl.getError();
  if (error !== gl.NO_ERROR) {
    const errorNames = {
      0x0500: 'INVALID_ENUM',
      0x0501: 'INVALID_VALUE',
      0x0502: 'INVALID_OPERATION',
      0x0503: 'STACK_OVERFLOW',
      0x0504: 'STACK_UNDERFLOW',
      0x0505: 'OUT_OF_MEMORY',
      0x0506: 'INVALID_FRAMEBUFFER_OPERATION'
    };
    console.error(`${operation}: ${errorNames[error] || error}`);
  }
}
```

### 4.2 Shader 调试

```glsl
// 可视化任意值
void main() {
  float debugValue = someComplexCalculation();

  // 映射到颜色
  vec3 debugColor = vec3(fract(debugValue), 0, 0);

  gl_FragColor = vec4(debugColor, 1.0);
}
```

### 4.3 性能分析

```javascript
// 使用 EXT_disjoint_timer_query
const ext = gl.getExtension('EXT_disjoint_timer_query');
const query = ext.createQueryEXT();

ext.beginQueryEXT(ext.TIME_ELAPSED_EXT, query);
// ... 绘制命令
ext.endQueryEXT(ext.TIME_ELAPSED_EXT);

// 稍后读取结果
const timeElapsed = ext.getQueryObjectEXT(query, ext.QUERY_RESULT_EXT);
console.log(`GPU time: ${timeElapsed / 1000000}ms`);
```

## 五、常见错误

### 5.1 黑屏/无渲染

检查清单：
- [ ] `gl.clear()` 被调用
- [ ] `gl.useProgram()` 在绘制前调用
- [ ] `gl.enableVertexAttribArray()` 启用所有 attribute
- [ ] `gl.bindBuffer()` 在 `gl.vertexAttribPointer()` 前
- [ ] 坐标转换正确（检查是否在视口外）
- [ ] 着色器编译成功

### 5.2 位置错误

```javascript
// 错误：忘记翻转 Y 轴
// GLSL: gl_Position = vec4(clipSpace, 0, 1);
// 正确：gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

// 错误：混淆 pixel 和 NDC 坐标
// NDC: -1 to 1
// Pixel: 0 to canvas.width
```

### 5.3 性能问题

```javascript
// 错误：每帧创建新 buffer
function draw() {
  const buffer = gl.createBuffer();  // 不要这样做！
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
}

// 正确：复用 buffer
const buffer = gl.createBuffer();
function draw() {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
}
```

## 六、参考链接

- [WebGL 规范](https://www.khronos.org/registry/webgl/specs/latest/1.0/)
- [GLSL 参考](https://www.khronos.org/files/opengles_shading_language.pdf)
- [WebGL Stats](https://webglstats.com/) - 检查浏览器支持
- [WebGL Report](http://webglreport.com/) - 检查 WebGL 能力
