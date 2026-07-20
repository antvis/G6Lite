import type { Camera } from '../renderer/camera.js';
import type { GraphNode, NodeConfig, NodeStateStyleOverride, NodeStyleConfig } from '../types.js';

export interface NodeOverlayDrawParams {
  node: GraphNode & { x: number; y: number };
  x: number;
  y: number;
  nodeSize: number;
  dpr: number;
  zoom: number;
  camera: Camera;
  time: number;
}

export interface NodeBoundaryAnchorParams {
  node: GraphNode;
  placement: 'left' | 'right' | 'top' | 'bottom';
  crossOffsetRatio: number;
  width: number;
  height: number;
  borderRadius: number;
}

export interface NodeExtension {
  base?: 'circle' | 'rect';
  style?: Partial<NodeStyleConfig>;
  stateStyles?: Partial<Record<string, NodeStateStyleOverride>>;
  getStyle?: (node: GraphNode) => Partial<NodeStyleConfig>;
  /** Returns a screen-space offset from the node center to its visual boundary. */
  getBoundaryAnchor?: (params: NodeBoundaryAnchorParams) => { x: number; y: number };
  drawOverlay?: (ctx: CanvasRenderingContext2D, params: NodeOverlayDrawParams) => boolean | void;
}

export abstract class BaseNode implements NodeExtension {
  base: 'circle' | 'rect' = 'circle';
  style?: Partial<NodeStyleConfig>;
  stateStyles?: Partial<Record<string, NodeStateStyleOverride>>;

  getStyle?(_node: GraphNode): Partial<NodeStyleConfig>;
  getBoundaryAnchor?(_params: NodeBoundaryAnchorParams): { x: number; y: number };
  drawOverlay?(_ctx: CanvasRenderingContext2D, _params: NodeOverlayDrawParams): boolean | void;
}

export type NodeExtensionInput = NodeExtension | (new () => NodeExtension);

const NODE_REGISTRY = new Map<string, NodeExtensionInput>();
const NODE_INSTANCE_CACHE = new Map<string, NodeExtension>();

export function registerNode(name: string, extension: NodeExtensionInput): void {
  NODE_REGISTRY.set(name, extension);
  NODE_INSTANCE_CACHE.delete(name);
}

export function register(type: 'node', name: string, extension: NodeExtensionInput): void {
  if (type !== 'node') {
    throw new Error(`Unsupported extension type: ${type}`);
  }
  registerNode(name, extension);
}

export function getNodeExtension(type: string | undefined): NodeExtension | undefined {
  if (!type || type === 'circle' || type === 'rect') return undefined;
  const cached = NODE_INSTANCE_CACHE.get(type);
  if (cached) return cached;
  const entry = NODE_REGISTRY.get(type);
  if (!entry) return undefined;
  const extension = typeof entry === 'function' ? new entry() : entry;
  NODE_INSTANCE_CACHE.set(type, extension);
  return extension;
}

export function getNodeBaseType(config?: NodeConfig): 'circle' | 'rect' {
  const type = config?.type;
  if (type === 'rect') return 'rect';
  if (type === 'circle' || !type) return 'circle';
  return getNodeExtension(type)?.base ?? 'circle';
}

function hasState(states: unknown, state: string): boolean {
  if (!states) return false;
  if (states instanceof Set) return states.has(state);
  return Array.isArray(states) ? states.includes(state) : false;
}

export class BreathingNode extends BaseNode {
  base = 'circle' as const;
  stateStyles = {
    active: { haloWidth: 10 },
    selected: { haloWidth: 14 },
    highlight: { haloWidth: 10 },
  };

  drawOverlay(ctx: CanvasRenderingContext2D, params: NodeOverlayDrawParams): boolean {
    const states = (params.node as { states?: unknown }).states;
    if (
      !hasState(states, 'active') &&
      !hasState(states, 'selected') &&
      !hasState(states, 'highlight')
    ) {
      return false;
    }

    const t = params.time / 700;
    const pulse = (Math.sin(t) + 1) / 2;
    const radius = Math.max(8 * params.dpr, params.nodeSize * params.zoom * 0.5);
    const outerRadius = radius + (8 + pulse * 8) * params.dpr;

    ctx.save();
    ctx.beginPath();
    ctx.arc(params.x, params.y, outerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(24, 144, 255, ${0.18 + (1 - pulse) * 0.18})`;
    ctx.lineWidth = Math.max(1, 2 * params.dpr);
    ctx.stroke();
    ctx.restore();

    return true;
  }
}

registerNode('breathing-node', BreathingNode);
