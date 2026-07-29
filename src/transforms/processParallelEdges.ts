import type { InternalEdge } from '../dataModel';
import type { EdgeConfig, ParallelEdgesConfig, TransformOption } from '../types';

export interface ResolvedParallelEdgesConfig {
  enabled: boolean;
  offset: number;
  mergeBy: Array<'source' | 'target'>;
  includeReverse: boolean;
  minOffset: number;
  maxOffset: number;
}

const DEFAULT_CONFIG: ResolvedParallelEdgesConfig = {
  enabled: false,
  offset: 20,
  mergeBy: ['source', 'target'],
  includeReverse: true,
  minOffset: 0,
  maxOffset: 80,
};

export function resolveParallelEdgesConfig(
  transforms: TransformOption[] | undefined,
  edgeConfig: EdgeConfig | undefined,
): ResolvedParallelEdgesConfig {
  let enabledByTransform = false;
  let transformConfig: ParallelEdgesConfig | undefined;

  for (const transform of transforms ?? []) {
    if (transform === 'process-parallel-edges') {
      enabledByTransform = true;
      continue;
    }
    if (
      typeof transform === 'object' &&
      transform !== null &&
      transform.type === 'process-parallel-edges'
    ) {
      enabledByTransform = true;
      transformConfig = transform.options as ParallelEdgesConfig | undefined;
    }
  }

  const edgeParallel = edgeConfig?.parallelEdges;
  const edgeConfigObject = typeof edgeParallel === 'object' ? edgeParallel : undefined;
  const enabledByEdge = edgeParallel === true || edgeConfigObject?.enabled === true;
  const explicitlyDisabled = edgeParallel === false || edgeConfigObject?.enabled === false;

  const merged = {
    ...DEFAULT_CONFIG,
    ...transformConfig,
    ...edgeConfigObject,
  };

  return {
    ...merged,
    enabled: explicitlyDisabled ? false : enabledByTransform || enabledByEdge,
    offset: positiveNumber(merged.offset, DEFAULT_CONFIG.offset),
    minOffset: nonNegativeNumber(merged.minOffset, DEFAULT_CONFIG.minOffset),
    maxOffset: nonNegativeNumber(merged.maxOffset, DEFAULT_CONFIG.maxOffset),
    includeReverse: merged.includeReverse ?? DEFAULT_CONFIG.includeReverse,
    mergeBy: normalizeMergeBy(merged.mergeBy),
  };
}

export function processParallelEdges(
  edges: readonly InternalEdge[],
  config: ResolvedParallelEdgesConfig,
): void {
  for (const edge of edges) {
    edge.parallel = undefined;
  }
  if (!config.enabled) return;

  const groups = new Map<string, InternalEdge[]>();
  for (const edge of edges) {
    if (edge.source === edge.target) continue;
    const key = getGroupKey(edge, config);
    const group = groups.get(key);
    if (group) group.push(edge);
    else groups.set(key, [edge]);
  }

  for (const [groupKey, group] of groups) {
    const directionCounts = new Map<string, number>();
    for (const edge of group) {
      const directionKey = `${edge.source}\u0000${edge.target}`;
      directionCounts.set(directionKey, (directionCounts.get(directionKey) ?? 0) + 1);
    }

    const directionIndex = new Map<string, number>();
    for (let i = 0; i < group.length; i++) {
      const edge = group[i];
      const directionKey = `${edge.source}\u0000${edge.target}`;
      const sameDirectionIndex = directionIndex.get(directionKey) ?? 0;
      directionIndex.set(directionKey, sameDirectionIndex + 1);

      const rawOffset = centeredOffset(i, group.length, config.offset);
      const offset = clampOffset(rawOffset, config.minOffset, config.maxOffset);
      const canonicalSource = getCanonicalSource(edge);
      const isReversedInGroup = config.includeReverse && edge.source !== canonicalSource;

      edge.parallel = {
        groupKey,
        groupSize: group.length,
        groupIndex: i,
        sameDirectionIndex,
        sameDirectionSize: directionCounts.get(directionKey) ?? 1,
        directionSign: isReversedInGroup ? -1 : 1,
        offset,
        curvature: 0,
        isReversedInGroup,
      };
    }
  }
}

function normalizeMergeBy(
  value: Array<'source' | 'target'> | undefined,
): Array<'source' | 'target'> {
  if (!value || value.length === 0) return DEFAULT_CONFIG.mergeBy;
  const hasSource = value.includes('source');
  const hasTarget = value.includes('target');
  return hasSource && hasTarget ? ['source', 'target'] : DEFAULT_CONFIG.mergeBy;
}

function getGroupKey(edge: InternalEdge, config: ResolvedParallelEdgesConfig): string {
  if (!config.includeReverse) return `${edge.source}\u0000${edge.target}`;
  const a = edge.source <= edge.target ? edge.source : edge.target;
  const b = edge.source <= edge.target ? edge.target : edge.source;
  return `${a}\u0000${b}`;
}

function getCanonicalSource(edge: InternalEdge): string {
  return edge.source <= edge.target ? edge.source : edge.target;
}

function centeredOffset(index: number, size: number, step: number): number {
  if (size <= 1) return 0;
  return (index - (size - 1) / 2) * step;
}

function clampOffset(value: number, min: number, max: number): number {
  if (value === 0) return 0;
  const sign = value < 0 ? -1 : 1;
  const abs = Math.abs(value);
  return sign * Math.min(Math.max(abs, min), max);
}

function positiveNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function nonNegativeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}
