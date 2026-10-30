/**
 * Demo: 缩进树 — 项目目录结构
 *
 * 展示两种风格：
 * 1. 有背景节点 + 按深度着色（默认）
 * 2. 子节点无样式 — 只有根节点有背景，子节点文字直接显示在边上（设计稿风格）
 *
 * 通过右上角菜单切换两种模式。
 */
import { Graph } from '../../src/index.ts';
import { mountCanvasMenu } from './demo-panel.ts';
import { attachLabelsCanvas, type GraphInstanceWithTools } from '../tooling.ts';

const data = {
  nodes: [
    { id: 'root', name: 'my-project' },
    { id: 'src', name: 'src' },
    { id: 'comp', name: 'components' },
    { id: 'pages', name: 'pages' },
    { id: 'utils', name: 'utils' },
    { id: 'app', name: 'App.tsx' },
    { id: 'index', name: 'index.tsx' },
    { id: 'public', name: 'public' },
    { id: 'assets', name: 'assets' },
    { id: 'logo', name: 'logo.svg' },
    { id: 'pkg', name: 'package.json' },
    { id: 'readme', name: 'README.md' },
    { id: 'tsconf', name: 'tsconfig.json' },
    { id: 'home', name: 'Home.tsx' },
    { id: 'about', name: 'About.tsx' },
    { id: 'req', name: 'request.ts' },
    { id: 'fmt', name: 'format.ts' },
  ],
  edges: [
    { source: 'root', target: 'src' },
    { source: 'root', target: 'public' },
    { source: 'root', target: 'pkg' },
    { source: 'root', target: 'readme' },
    { source: 'root', target: 'tsconf' },
    { source: 'src', target: 'comp' },
    { source: 'src', target: 'pages' },
    { source: 'src', target: 'utils' },
    { source: 'src', target: 'app' },
    { source: 'src', target: 'index' },
    { source: 'comp', target: 'home' },
    { source: 'comp', target: 'about' },
    { source: 'utils', target: 'req' },
    { source: 'utils', target: 'fmt' },
    { source: 'public', target: 'assets' },
    { source: 'assets', target: 'logo' },
  ],
};

const NODE_W = 120;
const NODE_H = 28;
const FONT_SIZE = 12;
const CHAR_WIDTH = FONT_SIZE * 0.5;
const NODE_PADDING = 2;

/** Measure text width in graph units (approximate) */
function measureTextWidth(text: string): number {
  return text.length * CHAR_WIDTH + NODE_PADDING;
}

const layoutBase = {
  type: 'indented' as const,
  indent: 80,
  rowHeight: 52,
  direction: 'LR' as const,
};

const edgeBase = {
  type: 'polyline' as const,
  style: {
    lineWidth: 2,
    router: 'indented' as const,
    radius: 24,
    endArrow: false,
    startArrow: false,
  },
};

// ── 模式一：所有节点有背景色 ────────────────────────
function configStyled() {
  return {
    node: {
      type: 'rect' as const,
      style: {
        fill: (n: any) => n.data?._nodeColor ?? '#5B8FF9',
        width: NODE_W,
        height: NODE_H,
        borderRadius: 4,
        opacity: 0.9,
      },
    },
    edge: {
      ...edgeBase,
      style: {
        ...edgeBase.style,
        stroke: (src: any) => src.data?._edgeColor ?? '#c0c0c0',
      },
    },
    layout: {
      ...layoutBase,
      nodeColors: ['#4A90D9', '#F08F56', '#00C9C9', '#D580FF', '#7863FF'],
      edgeColors: ['#1783FF', '#F08F56', '#00C9C9', '#D580FF', '#7863FF'],
    },
    labelColor: '#fff' as any,
    labelPosition: 'inside' as const,
  };
}

// ── 模式二：子节点无样式（设计稿风格）──────────────────
// 参考 G6 IndentedNode：节点宽度 = 固定间距 + 文字宽度
// 边到达节点右边缘（覆盖文字长度），文字从左边缘开始，边长度随文字自适应
function configMinimal() {
  return {
    node: {
      type: 'rect' as const,
      style: {
        fill: (n: any) => n.data?._isRoot ? '#4A90D9' : '#ffffff',
        width: (n: any) => n.data?._isRoot ? NODE_W : measureTextWidth(n.name ?? n.id),
        height: NODE_H,
        borderRadius: (n: any) => n.data?._isRoot ? 6 : 0,
        stroke: (n: any) => n.data?._isRoot ? '#4A90D9' : '#ffffff',
        strokeWidth: 0,
        opacity: (n: any) => n.data?._isRoot ? 1 : 0,
      },
    },
    edge: {
      ...edgeBase,
      style: {
        ...edgeBase.style,
        stroke: (src: any) => src.data?._edgeColor ?? '#c0c0c0',
        indentTarget: 'right' as const,
      },
    },
    layout: {
      ...layoutBase,
      edgeColors: ['#1783FF', '#F08F56', '#00C9C9', '#D580FF', '#7863FF'],
    },
    labelColor: ((n: any) => n.data?._isRoot ? '#fff' : '#333') as any,
    labelPosition: ((n: any) => n.data?._isRoot ? 'inside' : 'right') as any,
  };
}

export async function run(container: string | HTMLElement) {
  const wrapper =
    typeof container === 'string'
      ? (document.querySelector(container)! as HTMLElement)
      : container;
  wrapper.style.position = 'relative';

  let currentGraph: any = null;
  let currentMode = 'styled';

  async function renderMode(mode: string) {
    if (currentGraph) {
      currentGraph.destroy();
      // Remove old label canvas
      const oldLabel = wrapper.querySelector('.label-canvas');
      if (oldLabel) oldLabel.remove();
    }
    currentMode = mode;

    const cfg = mode === 'styled' ? configStyled() : configMinimal();

    const graph = new Graph({
      autoFit: true,
      container: wrapper,
      data: JSON.parse(JSON.stringify(data)),
      node: cfg.node as any,
      edge: cfg.edge as any,
      layout: cfg.layout,
      behaviors: ['zoom-canvas', 'drag-canvas'],
      theme: 'light',
    });

    await graph.render();

    const g = graph as unknown as GraphInstanceWithTools;
    const labelColorFn = cfg.labelColor;
    const labelPosition = cfg.labelPosition;
    const isMinimal = currentMode === 'minimal';
    attachLabelsCanvas(wrapper, g, {
      nodeLabel: (n) => n.name ?? n.id,
      position: labelPosition,
      nodeSize: (n: any) => {
        if (isMinimal && !n.data?._isRoot) {
          return { width: measureTextWidth(n.name ?? n.id), height: NODE_H };
        }
        return { width: NODE_W, height: NODE_H };
      },
      fontSize: FONT_SIZE,
      color: labelColorFn,
    });

    currentGraph = graph;
  }

  mountCanvasMenu(wrapper, {
    caption: '样式',
    items: [
      { value: 'styled', label: '有背景' },
      { value: 'minimal', label: '无样式' },
    ],
    value: 'styled',
    onSelect(value) {
      if (value !== currentMode) void renderMode(value);
    },
  });

  await renderMode('styled');

  return {
    fitView: () => currentGraph?.fitView(),
    destroy: () => {
      if (currentGraph) currentGraph.destroy();
      wrapper.querySelector(':scope > [data-canvas-controls]')?.remove();
    },
  };
}
