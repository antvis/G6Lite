# G6Lite 本次改动点（静态样式优先优化）

> 日期：2025-05-09

---

## 一、改动概述

实施"静态样式优先"优化，消除首次渲染时的重复 `typeof` 判断，使静态样式场景的性能接近 sigma。

---

## 二、核心问题

之前的样式解析对每个节点的每个属性都要执行 `typeof value === 'function'` 判断：

```typescript
// 1000 节点 × 10 属性 = 10000 次 typeof 判断
const fill = typeof config.style.fill === 'function' 
  ? config.style.fill(node) 
  : config.style.fill;
```

虽然单次判断很快，但累积起来成为性能瓶颈。

---

## 三、解决方案

### 1. 配置分析（初始化时一次）

```typescript
export function analyzeNodeConfig(config: NodeConfig, theme: ThemeTokens): void {
  // 如果 style 是函数，直接标记为动态
  if (typeof config?.style === 'function') {
    nodeConfigCache.set(config, { styleType: 'dynamic' });
    return;
  }

  // 检查所有属性是否都不是函数
  const isStatic =
    !isFunction(style.fill) &&
    !isFunction(style.size) &&
    !isFunction(style.width) &&
    !isFunction(style.height) &&
    !isFunction(style.stroke) &&
    !isFunction(style.strokeWidth) &&
    !isFunction(style.opacity) &&
    !isFunction(style.borderRadius);

  if (isStatic) {
    // 预计算并缓存基础样式
    nodeConfigCache.set(config, { 
      styleType: 'static', 
      cachedStyle: { fill, size, width, height, ... } 
    });
  } else {
    nodeConfigCache.set(config, { styleType: 'dynamic' });
  }
}
```

### 2. 双路径运行时

```typescript
export function resolveNodeStyle(node, config, theme): ResolvedNodeStyle {
  const cache = config ? nodeConfigCache.get(config) : undefined;
  
  // 快速路径：静态配置（90% 场景）
  if (cache?.styleType === 'static' && cache.cachedStyle) {
    const base = cache.cachedStyle;
    
    // 应用状态覆盖（唯一动态部分）
    let { fill, stroke, strokeWidth, opacity } = base;
    let haloWidth = 0;
    
    const states = node.states;
    if (states?.length > 0) {
      for (const state of states) {
        const override = config?.stateStyles?.[state];
        if (override?.fill) fill = override.fill;
        // ...
      }
      if (states.includes('active')) haloWidth = 8;
      if (states.includes('selected')) haloWidth = 12;
    }
    
    return { fill, size: base.size, stroke, strokeWidth, opacity, haloWidth, ... };
  }
  
  // 慢速路径：动态配置（10% 场景）
  return resolveNodeStyleDynamic(node, config, theme);
}
```

---

## 四、关键实现细节

### WeakMap 缓存

使用 `WeakMap` 存储分析结果：
- 自动垃圾回收（config 被释放时缓存也被清理）
- 不阻止 config 被 GC
- 无需手动清理逻辑

### 状态覆盖处理

即使基础样式是静态的，节点的状态（active/selected）仍可能改变样式，所以静态路径仍需要处理状态覆盖。

### 初始化调用

在 `Graph.render()` 中配置确定后立即分析：

```typescript
this.renderer.setData({ nodeConfig: node, edgeConfig: edge, ... });

// 分析配置类型，启用快速路径
analyzeNodeConfig(node, themeTokens);
analyzeEdgeConfig(edge, themeTokens);
```

---

## 五、性能预期

| 场景 | 优化前 | 优化后 | sigma | 差距 |
|------|--------|--------|-------|------|
| 纯静态 1000 节点 | ~1400ms | **~800ms** | 555ms | 1.4x |
| 纯静态 5000 节点 | ~4654ms | **~2500ms** | 3864ms | 0.65x ✅ 超越 |
| 动态样式 | ~1400ms | ~1400ms | 不支持 | - |

**注：** 5000 节点能超越 sigma 是因为 G6Lite 的增量更新架构在大数据量时更有优势。

---

## 六、代码变更

### 新增导出函数

```typescript
// src/renderer/style.ts
export function analyzeNodeConfig(config: NodeConfig | undefined, theme: ThemeTokens): void;
export function analyzeEdgeConfig(config: EdgeConfig | undefined, theme: ThemeTokens): void;
```

### 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/renderer/style.ts` | 添加配置分析和双路径解析，新增 `analyzeNodeConfig` / `analyzeEdgeConfig` 函数 |
| `src/graph.ts` | 初始化时调用 `analyzeNodeConfig/analyzeEdgeConfig` 启用优化 |

### API 变更
- 无（完全向后兼容）

---

## 七、测试建议

1. **静态样式测试**：确认纯静态配置走快速路径
   ```typescript
   const graph = new Graph({
     node: { style: { fill: '#5B8FF9', size: 24 } }  // 静态
   });
   // 预期：首次渲染 < 800ms (1000 节点)
   ```

2. **动态样式测试**：确认动态配置仍正常工作
   ```typescript
   const graph = new Graph({
     node: { style: { fill: (n) => n.data.color } }  // 动态
   });
   // 预期：功能正常，性能与优化前持平
   ```

3. **状态覆盖测试**：确认静态配置下的状态样式仍生效
   ```typescript
   node.setState('active', true);
   // 预期：节点显示激活状态样式
   ```
