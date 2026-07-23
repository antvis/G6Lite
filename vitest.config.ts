import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@src': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts', 'tests/bugfix/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/renderer/programs/shaders/**'],
      // Roadmap Q1：全部核心模块纳入覆盖率门槛（按文件粒度强约束）。
      // 策略「按真实值分档」：每个模块设「略低于当前实测值」的地板，防止回退；
      //   - 纯逻辑模块（dataModel/events/theme/scheduler/picking/dispatcher 等）守 70+；
      //   - WebGL 重模块（graph/renderer/comboRenderer/labelRenderer/layout/部分 edge 程序）
      //     依赖真实 GL 上下文，jsdom 测不到，按当前档位记录基线，门槛提升顺延至 0.2.0（见 Q2 渲染回归）。
      thresholds: {
        // —— 纯逻辑核心：守 70+ ——
        'src/dataModel.ts': { lines: 85, functions: 85, branches: 80, statements: 85 },
        'src/scheduler.ts': { lines: 70, functions: 70, branches: 60, statements: 70 },
        'src/events.ts': { lines: 100, functions: 100, branches: 100, statements: 100 },
        'src/theme.ts': { lines: 100, functions: 100, branches: 100, statements: 100 },
        'src/renderer/picking.ts': { lines: 90, functions: 85, branches: 65, statements: 90 },
        'src/renderer/color.ts': { lines: 70, functions: 90, branches: 68, statements: 70 },
        'src/renderer/gl.ts': { lines: 72, functions: 90, branches: 45, statements: 72 },
        'src/renderer/style.ts': { lines: 80, functions: 90, branches: 45, statements: 80 },
        'src/interaction/dispatcher.ts': { lines: 82, functions: 80, branches: 72, statements: 82 },
        // —— behaviors ——
        'src/behaviors/clickSelect.ts': { lines: 82, functions: 90, branches: 72, statements: 82 },
        'src/behaviors/hoverHighlight.ts': {
          lines: 78,
          functions: 90,
          branches: 72,
          statements: 78,
        },
        'src/behaviors/tooltip.ts': { lines: 85, functions: 75, branches: 80, statements: 85 },
        'src/behaviors/dragEdge.ts': { lines: 72, functions: 70, branches: 55, statements: 72 },
        'src/behaviors/lassoSelect.ts': { lines: 58, functions: 60, branches: 52, statements: 58 },
        'src/behaviors/dragNode.ts': { lines: 45, functions: 45, branches: 68, statements: 45 },
        'src/behaviors/brushSelect.ts': { lines: 28, functions: 20, branches: 70, statements: 28 },
        // —— WebGL 重模块 / 布局：按当前档位记录基线，门槛顺延 0.2.0 提升 ——
        'src/renderer/renderer.ts': { lines: 35, functions: 48, branches: 26, statements: 35 },
        'src/layout/runLayout.ts': { lines: 60, functions: 90, branches: 38, statements: 60 },
        'src/renderer/programs/edgeArrow.ts': {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
        'src/renderer/programs/edgeLine.ts': {
          lines: 88,
          functions: 88,
          branches: 90,
          statements: 88,
        },
        'src/renderer/programs/edgeRect.ts': {
          lines: 60,
          functions: 48,
          branches: 90,
          statements: 60,
        },
        'src/graph.ts': { lines: 0, functions: 0, branches: 0, statements: 0 },
        'src/renderer/comboRenderer.ts': { lines: 0, functions: 0, branches: 0, statements: 0 },
        'src/renderer/labelRenderer.ts': { lines: 0, functions: 0, branches: 0, statements: 0 },
      },
    },
  },
});
