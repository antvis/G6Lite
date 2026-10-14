'use client';

import { useTheme } from 'fumadocs-ui/provider/base';
import { LoaderCircle, Minus, Plus, Scan } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { Camera, Graph, GraphData, GraphOptions } from '../../../../src/index.ts';
import { withBasePath } from '@/lib/shared';
import type { Locale } from '@/lib/i18n';

import styles from './homepage.module.css';
import { homepageCopy } from './content';
import { bindHeroGestures } from './hero-gestures';

type Status = 'waiting' | 'loading' | 'ready' | 'error';
type Metrics = { nodes: number; edges: number; loadMs: number; renderMs: number };

function visualOptions(dark: boolean): Pick<GraphOptions, 'theme' | 'node' | 'edge'> {
  const palette = dark
    ? ['#aabcf3', '#91bfe0', '#88c6b6', '#ccc1e8']
    : ['#7186c8', '#75a9cf', '#78b9a7', '#aaa0cb'];
  return {
    // White + multiply and black + screen let the Hero gradient show through
    // without lowering the opacity of nodes and edges as a whole.
    theme: { type: dark ? 'dark' : 'light', canvasBackground: dark ? '#000000' : '#ffffff' },
    node: {
      type: 'circle',
      style: {
        size: (node) => Number(node.data?.size) || 6,
        fill: (node) => palette[(Number(node.data?.cluster) || 0) % palette.length],
        strokeWidth: 0,
        label: () => false,
      },
    },
    edge: {
      type: 'line',
      style: { stroke: dark ? '#485674' : '#c8d2e7', lineWidth: 0.6, endArrow: false },
    },
  };
}

/** Validate the same-site static asset before passing it to the renderer. */
function graphData(value: unknown): GraphData {
  if (!value || typeof value !== 'object') throw new Error('Invalid graph data');
  const data = value as GraphData;
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges))
    throw new Error('Missing graph data');
  if (!data.nodes.length || data.nodes.length > 500 || data.edges.length > 1500) {
    throw new Error('Graph exceeds the homepage display budget');
  }
  const ids = new Set<string>();
  for (const node of data.nodes) {
    if (!node || typeof node.id !== 'string' || ids.has(node.id)) throw new Error('Invalid node');
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y))
      throw new Error('Missing coordinates');
    ids.add(node.id);
  }
  for (const edge of data.edges) {
    if (!edge || !ids.has(edge.source) || !ids.has(edge.target)) throw new Error('Invalid edge');
  }
  return data;
}

/** A single on-demand WebGL instance with a loading state and explicit retry. */
export function HeroLiveGraph({ locale }: { locale: Locale }) {
  const copy = homepageCopy[locale].graph;
  const { resolvedTheme } = useTheme();
  const mountRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const darkRef = useRef(false);
  const readyRef = useRef(false);
  const failRef = useRef<(() => void) | null>(null);
  const gestureRef = useRef<ReturnType<typeof bindHeroGestures> | null>(null);
  const [status, setStatus] = useState<Status>('waiting');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [pointers, setPointers] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const ready = status === 'ready';

  useEffect(() => {
    darkRef.current = resolvedTheme === 'dark';
    const graph = graphRef.current;
    if (!graph || !readyRef.current) return;
    try {
      graph.updateOptions(visualOptions(darkRef.current));
    } catch {
      failRef.current?.();
    }
  }, [resolvedTheme]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let failed = false;
    let scheduled = false;
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let canvas: HTMLCanvasElement | null = null;
    const controller = new AbortController();

    const clearPending = () => {
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
      if (timeout !== undefined) clearTimeout(timeout);
    };
    const destroyGraph = () => {
      readyRef.current = false;
      gestureRef.current?.destroy();
      gestureRef.current = null;
      canvas?.removeEventListener('webglcontextlost', onContextLost);
      const graph = graphRef.current;
      graphRef.current = null;
      graph?.destroy();
      mount.replaceChildren();
    };
    const fail = () => {
      if (disposed || failed) return;
      failed = true;
      clearPending();
      controller.abort();
      destroyGraph();
      setStatus('error');
      setCamera(null);
      setPointers(0);
    };
    const onContextLost = () => fail();
    failRef.current = fail;

    const initialize = async () => {
      if (disposed || failed) return;
      setStatus('loading');
      timeout = setTimeout(fail, 12000);
      const started = performance.now();
      try {
        const mobile = window.matchMedia('(max-width: 767px)').matches;
        const [module, data] = await Promise.all([
          import('../../../../src/index.ts'),
          fetch(withBasePath(`/homepage/graph-${mobile ? 'mobile' : 'desktop'}.json`), {
            signal: controller.signal,
          }).then(async (response) => {
            if (!response.ok) throw new Error('Unable to load graph');
            return graphData(await response.json());
          }),
        ]);
        if (disposed || failed) return;
        const loaded = performance.now();
        const initialDark = darkRef.current;
        const graph = new module.Graph({
          container: mount,
          data,
          // Preset coordinates: never run a force layout on the homepage.
          ...visualOptions(initialDark),
          autoFitOnResize: { padding: 24, minZoom: 0.01 },
          behaviors: ['drag-canvas', 'drag-node', 'highlight-node'],
        });
        graphRef.current = graph;
        canvas = mount.querySelector('canvas');
        canvas?.addEventListener('webglcontextlost', onContextLost);
        await graph.render();
        if (disposed || failed) return;
        graph.fitView({ padding: 24, minZoom: 0.01 });
        // A theme switch during async loading must also update the new instance.
        if (initialDark !== darkRef.current) graph.updateOptions(visualOptions(darkRef.current));
        readyRef.current = true;
        if (!canvas) throw new Error('Missing graph canvas');
        gestureRef.current = bindHeroGestures(
          graph,
          canvas,
          (nextCamera, count) => {
            setCamera(nextCamera);
            setPointers(count);
          },
          fail,
        );
        clearPending();
        setMetrics({
          nodes: data.nodes.length,
          edges: data.edges.length,
          loadMs: Math.round(loaded - started),
          renderMs: Math.round(performance.now() - loaded),
        });
        setCamera(graph.getCamera());
        setStatus('ready');
      } catch {
        fail();
      }
    };

    const schedule = () => {
      if (scheduled || disposed) return;
      scheduled = true;
      if (typeof window.requestIdleCallback === 'function') {
        idle = window.requestIdleCallback(() => void initialize(), { timeout: 1200 });
      } else {
        timer = setTimeout(() => void initialize(), 150);
      }
    };
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              observer?.disconnect();
              schedule();
            }
          });
    if (observer) observer.observe(mount);
    else schedule();

    return () => {
      disposed = true;
      observer?.disconnect();
      clearPending();
      controller.abort();
      failRef.current = null;
      destroyGraph();
    };
  }, [attempt]);

  const control = (action: 'fit' | 'in' | 'out') => {
    const graph = graphRef.current;
    if (!graph || !readyRef.current) return;
    try {
      gestureRef.current?.reset();
      if (action === 'fit') graph.fitView({ padding: 24, minZoom: 0.01 });
      else graph.zoomBy(action === 'in' ? 1.25 : 0.8, { minZoom: 0.1, maxZoom: 6 });
      setCamera(graph.getCamera());
    } catch {
      failRef.current?.();
    }
  };

  const retry = () => {
    setStatus('waiting');
    setMetrics(null);
    setCamera(null);
    setPointers(0);
    setAttempt((current) => current + 1);
  };

  return (
    <div
      className={styles.liveGraph}
      role="region"
      aria-label={copy.region}
      aria-busy={status === 'waiting' || status === 'loading'}
      data-graph-status={status}
      data-node-count={metrics?.nodes}
      data-edge-count={metrics?.edges}
      data-load-ms={metrics?.loadMs}
      data-render-ms={metrics?.renderMs}
      data-zoom={camera?.zoom}
      data-camera-x={camera?.x}
      data-camera-y={camera?.y}
      data-active-pointers={pointers}
    >
      <div className={styles.liveGraphMount} ref={mountRef} />
      <div className={styles.graphGrid} aria-hidden="true" />
      {status === 'waiting' || status === 'loading' ? (
        <div className={styles.graphState} role="status">
          <LoaderCircle className={styles.graphSpinner} aria-hidden="true" />
          <p>{copy.loading}</p>
        </div>
      ) : status === 'error' ? (
        <div className={styles.graphState} role="alert">
          <p>{copy.error}</p>
          <span>{copy.errorHint}</span>
          <button type="button" onClick={retry}>
            {copy.retry}
          </button>
        </div>
      ) : null}
      <div className={styles.canvasTools} role="toolbar" aria-label={copy.toolbar}>
        <button
          type="button"
          aria-label={copy.fit}
          title={copy.fit}
          disabled={!ready}
          onClick={() => control('fit')}
        >
          <Scan />
        </button>
        <button
          type="button"
          aria-label={copy.zoomIn}
          title={copy.zoomInTitle}
          disabled={!ready}
          onClick={() => control('in')}
        >
          <Plus />
        </button>
        <button
          type="button"
          aria-label={copy.zoomOut}
          title={copy.zoomOutTitle}
          disabled={!ready}
          onClick={() => control('out')}
        >
          <Minus />
        </button>
      </div>
      <p className={styles.graphAccessibleStatus} aria-live="polite">
        {ready && metrics
          ? `${metrics.nodes} ${copy.nodes}, ${metrics.edges} ${copy.edges}. ${copy.instructions}`
          : ''}
      </p>
    </div>
  );
}
