/**
 * Graph: main entry. Creates container canvas, runs layout, renders with WebGL, registers behaviors.
 */

import { resolveTheme } from './theme.js';
import { runLayout } from './layout/index.js';
import { Renderer } from './renderer/renderer.js';
import { registerBehaviors } from './behaviors/index.js';
import type { GraphOptions, GraphData, ThemeOption, LayoutNode } from './types.js';
import type { Camera } from './renderer/camera.js';

export class Graph {
  private options: GraphOptions;
  private containerEl: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private behaviorTeardown: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private layoutNodes: LayoutNode[] = [];
  private initialCamera: Camera | null = null;

  constructor(options: GraphOptions) {
    this.options = options;
    this.containerEl = resolveContainer(options.container);
    this.canvas = ensureCanvas(this.containerEl);
    this.renderer = new Renderer(this.canvas);
  }

  async render(): Promise<void> {
    const { data, node, edge, layout, behaviors, theme } = this.options;
    const themeTokens = resolveTheme((theme as ThemeOption) ?? 'light');

    let nodes = data.nodes.map((n) => ({
      ...n,
      x: n.x ?? 0,
      y: n.y ?? 0,
    }));

    if (layout && data.nodes.length > 0) {
      const result = await runLayout(data, layout);
      nodes = result.nodes;
    }
    this.layoutNodes = nodes as LayoutNode[];

    this.renderer.setData({
      nodes,
      edges: data.edges,
      nodeConfig: node,
      edgeConfig: edge,
      theme: themeTokens,
    });

    if (behaviors?.length) {
      this.behaviorTeardown?.();
      this.behaviorTeardown = registerBehaviors(this.renderer, behaviors);
    }

    const width = this.containerEl.clientWidth || 800;
    const height = this.containerEl.clientHeight || 600;
    this.renderer.resize(width, height);
    // capture initial camera after first fit
    if (!this.initialCamera) {
      const cam = this.renderer.getCamera();
      this.initialCamera = { x: cam.x, y: cam.y, zoom: cam.zoom };
    }

    this.resizeObserver = new ResizeObserver(() => {
      const w = this.containerEl.clientWidth || 800;
      const h = this.containerEl.clientHeight || 600;
      this.renderer.resize(w, h);
    });
    this.resizeObserver.observe(this.containerEl);

    return undefined;
  }

  destroy(): void {
    this.behaviorTeardown?.();
    this.resizeObserver?.disconnect();
    this.canvas.remove();
  }

  /** Expose current camera for tools. */
  getCamera(): Camera {
    return this.renderer.getCamera();
  }

  /** Update camera (pan/zoom) and re-draw. */
  setCamera(partial: Partial<Camera>): void {
    this.renderer.setCamera(partial);
    const rect = this.containerEl.getBoundingClientRect();
    this.renderer.resize(rect.width || 800, rect.height || 600);
  }

  /** Reset camera to initial state captured after first render. */
  resetCamera(): void {
    if (!this.initialCamera) return;
    this.setCamera(this.initialCamera);
  }

  /** Return layouted nodes (id + x,y) for tools/labels. */
  getLayoutNodes(): LayoutNode[] {
    return this.layoutNodes.slice();
  }

  /** Return raw graph data as provided. */
  getData(): GraphData {
    return this.options.data;
  }

  /** Return underlying canvas element. */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}

function resolveContainer(container: string | HTMLElement): HTMLElement {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el || !(el instanceof HTMLElement)) throw new Error('Invalid container');
  return el;
}

function ensureCanvas(container: HTMLElement): HTMLCanvasElement {
  let canvas = container.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
  }
  return canvas;
}
