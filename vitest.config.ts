import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts', 'src/renderer/programs/shaders/**'],
      // Roadmap Q1：核心逻辑模块覆盖率门槛 ≥ 70%（按文件粒度强约束）。
      // 渲染层 / 布局层 / graph.ts 的回归用例属 Q2，暂不纳入门槛，避免误伤当前 CI。
      thresholds: {
        'src/dataModel.ts': { lines: 85, functions: 85, branches: 80, statements: 85 },
        'src/scheduler.ts': { lines: 70, functions: 70, branches: 60, statements: 70 },
        'src/events.ts': { lines: 100, functions: 100, branches: 100, statements: 100 },
        'src/theme.ts': { lines: 100, functions: 100, branches: 100, statements: 100 },
      },
    },
  },
});
