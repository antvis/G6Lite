'use client';

import { useTheme } from 'fumadocs-ui/provider/base';
import { LoaderCircle, Minus, Plus, Scan } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { Camera, Graph, GraphOptions } from '../../../../src/index.ts';
import type { Locale } from '@/lib/i18n';

import styles from './homepage.module.css';
import { homepageCopy } from './content';
import { HERO_MAX_ZOOM, HERO_MIN_ZOOM, bindHeroGestures } from './hero-gestures';

type Status = 'waiting' | 'loading' | 'ready' | 'error';
type Metrics = { nodes: number; edges: number; loadMs: number; renderMs: number };

function visualOptions(
  dark: boolean,
  getZoom: () => number,
): Pick<GraphOptions, 'theme' | 'node' | 'edge'> {
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
        // Graph units, multiplied by camera zoom. Overview zoom is about 0.24, so this
        // stays a ~2px dot. The camera ceiling is 20, so a hub grows to about 180px.
        size: 9,
        fill: (node) => palette[(Number(node.data?.cluster) || 0) % palette.length],
        strokeWidth: 0,
        // label() is re-read on each draw. Returning false hides the text and keeps it
        // out of collision. data.labelMinZoom is hero data, not a node-style field.
        label: (node) => {
          const label = node.data?.label;
          if (typeof label !== 'string' || !label) return false;
          const minZoom = Number(node.data?.labelMinZoom) || 0;
          return getZoom() >= minZoom ? label : false;
        },
        labelFontSize: 12,
        labelFontWeight: '600',
        labelColor: dark ? '#d7e0ff' : '#3c4e8c',
        labelPlacement: (node) => {
          const placement = node.data?.labelPlacement;
          if (
            placement === 'center' ||
            placement === 'left' ||
            placement === 'top' ||
            placement === 'bottom' ||
            placement === 'right'
          ) {
            return placement;
          }
          return 'right';
        },
        labelMaxWidth: 180,
      },
    },
    edge: {
      type: 'line',
      style: { stroke: dark ? '#485674' : '#c8d2e7', lineWidth: 0.6, endArrow: false },
    },
  };
}

/**
 * Narrow phones, and devices that report at most 4 GB or two CPU cores, use the
 * sampled cloud. Four cores is a normal laptop, so core count alone does not
 * replace the desktop citation network.
 */
function prefersCompactHeroGraph(): boolean {
  const narrow = window.matchMedia('(max-width: 767px)').matches;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const lowMemory = typeof memory === 'number' && memory > 0 && memory <= 4;
  const cores = navigator.hardwareConcurrency;
  const lowCpu = typeof cores === 'number' && cores > 0 && cores <= 2;
  return narrow || lowMemory || lowCpu;
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
      graph.updateOptions(visualOptions(darkRef.current, () => graph.getZoom()));
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
        const [module, dataModule] = await Promise.all([
          import('../../../../src/index.ts'),
          prefersCompactHeroGraph()
            ? import('./hero-graph-mobile.mjs')
            : import('./hero-graph-data.mjs'),
        ]);
        if (disposed || failed) return;
        const data = dataModule.createHeroGraph();
        // Keep the original layout with twice the horizontal span on desktop.
        if (!window.matchMedia('(max-width: 767px)').matches) {
          for (const node of data.nodes) node.x *= 2;
        }
        if (disposed || failed) return;
        const loaded = performance.now();
        const initialDark = darkRef.current;
        const graph = new module.Graph({
          container: mount,
          data,
          // Preset coordinates: never run a force layout on the homepage.
          ...visualOptions(initialDark, () => graphRef.current?.getZoom() ?? 0),
          // Overview zoom is below the default nodeMinZoom of 0.3, so the global gate
          // stays off. The label callback reveals more hubs as the camera zooms in.
          label: { hideOnLowZoom: false, scaleWithZoom: false, hideOnCollision: true },
          autoFit: { padding: 24, minZoom: 0.01 },
          behaviors: ['drag-canvas', 'drag-node', 'highlight-node'],
        });
        graphRef.current = graph;
        canvas = mount.querySelector('canvas');
        canvas?.addEventListener('webglcontextlost', onContextLost);
        await graph.render();
        if (disposed || failed) return;
        graph.fitView({ padding: 24, minZoom: 0.01 });
        // A theme switch during async loading must also update the new instance.
        if (initialDark !== darkRef.current) {
          graph.updateOptions(visualOptions(darkRef.current, () => graph.getZoom()));
        }
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
    const rect = mount.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0;
    if (visible || !observer) schedule();
    else observer.observe(mount);

    return () => {
      disposed = true;
      observer?.disconnect();
      clearPending();
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
      else {
        graph.zoomBy(action === 'in' ? 1.6 : 0.625, {
          minZoom: HERO_MIN_ZOOM,
          maxZoom: HERO_MAX_ZOOM,
        });
      }
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
