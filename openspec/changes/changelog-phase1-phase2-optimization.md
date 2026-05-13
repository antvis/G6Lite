# Phase 1 + Phase 2 优化完成：边样式静态优化 + 颜色预解析

> 日期：2025-05-09

---

## 优化概述

本次优化完成了 Phase 1（边样式静态优化）和 Phase 2（颜色预解析），显著减少首次渲染时的样式解析和颜色解析开销。

---

## 核心改动

### 1. 颜色预解析（Phase 2）

**问题**：`parseColor` 在首次渲染中被调用 4000+ 次（1000 节点 × 4 次颜色解析）

**方案**：在 `analyzeConfig` 时预解析颜色，运行时直接读取 RGB 数组

```typescript
// 优化前：运行时解析
const baseColor = parseColor(style.fill);  // 每次都要解析

// 优化后：预解析 + 运行时直接读取
interface CachedNodeStyle {
  fill: string;
  fillRGB: [number, number, number];  // 预解析！
  stroke: string;
  strokeRGB: [number, number, number];  // 预解析！
}

// 运行时零开销
const baseColor = style.fillRGB ?? parseColor(style.fill);  // 静态配置直接读取 fillRGB
```

**改动文件**：
- `src/renderer/style.ts`：
  - `CachedNodeStyle` / `CachedEdgeStyle` 新增 `fillRGB` / `strokeRGB`
  - `ResolvedNodeStyle` / `ResolvedEdgeStyle` 新增可选的 `fillRGB` / `strokeRGB`
  - `analyzeNodeConfig` / `analyzeEdgeConfig` 预解析颜色
  - `resolveNodeStyle` / `resolveEdgeStyle` 快速路径返回预解析颜色

### 2. Renderer 使用预解析颜色

**改动**：所有 `parseColor(style.fill)` 和 `parseColor(style.stroke)` 调用改为优先使用预解析颜色

```typescript
// 7 处修改，例如：
// src/renderer/renderer.ts 第 223 行
const baseColor = style.fillRGB ?? parseColor(style.fill);  // 优先使用预解析

// src/renderer/renderer.ts 第 224 行  
const strokeColor = style.strokeRGB ?? parseColor(style.stroke);  // 优先使用预解析
```

**修改位置**：
1. `process()` 节点处理（2 处）
2. `process()` 边处理（3 处）
3. `processHighlightDelta()` 边处理（1 处）
4. `patchStyles()` 节点和边处理（2 处）
5. `partialProcess()` 节点处理（2 处）

---

## 性能预期

### Phase 1（边样式静态优化）

| 场景 | 优化前 | 预期优化后 |
|------|--------|------------|
| 边样式解析 | ~150ms | ~20ms（走快速路径）|

### Phase 2（颜色预解析）

| 场景 | 优化前 | 预期优化后 |
|------|--------|------------|
| 节点颜色解析 | ~80ms | ~10ms（预解析）|
| 边颜色解析 | ~120ms | ~15ms（预解析）|
| **颜色解析总计** | **~200ms** | **~25ms** |

### 综合预期

| 指标 | 优化前 | Phase 1+2 后 | sigma | 差距 |
|------|--------|--------------|-------|------|
| 首次渲染 1000 节点 | ~800ms | **~600ms** | 555ms | 1.08x |
| 首次渲染 5000 节点 | ~2500ms | **~2000ms** | 3864ms | 0.52x ✅ 超越 |

---

## 代码变更统计

| 文件 | 变更行数 | 说明 |
|------|----------|------|
| `src/renderer/style.ts` | +25 行 | 预解析颜色，接口扩展 |
| `src/renderer/renderer.ts` | +10 行 | 10 处颜色解析优化 |

---

## 向后兼容性

- ✅ 完全向后兼容
- ✅ 动态配置不受影响（回退到 `parseColor`）
- ✅ 静态配置自动享受优化

---

## 下一步：Phase 3

**简化首次边渲染**（预期 -200ms）

```typescript
process() {
  this.processNodes(); // 完整渲染
  
  if (this.isFirstRender) {
    // 首次：简单直线，无箭头，无路由计算
    this.processSimpleEdges();
    
    // 异步计算完整边
    requestIdleCallback(() => {
      this.processComplexEdges();
      this.draw();
    });
  }
}
```

**目标**：600ms → 400ms（全面超越 sigma）
