'use client';

import { useTheme } from 'fumadocs-ui/provider/base';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
} from 'react';

import type { Graph, GraphOptions, LayoutConfig } from '../../../src/index.ts';
import {
  getG6LiteLayoutConfig,
  mockThemeColors,
  toG6LiteGraphData,
  type MockGraph,
  type MockNodeGroup,
} from '@/lib/ai-workspace-mock';
import type { Locale } from '@/lib/i18n';

import styles from './ai-workspace.module.css';

export type AiNativeGraphStatus = 'error' | 'loading' | 'ready';

export type AiNativeGraphHandle = {
  fitView(): void;
};

type NativeGraphProps = {
  graph: MockGraph;
  locale: Locale;
  onStatusChange?: (status: AiNativeGraphStatus, message?: string) => void;
};

const NODE_WIDTH = 132;
const NODE_HEIGHT = 48;

function visualOptions(
  graph: MockGraph,
  dark: boolean,
): Pick<GraphOptions, 'edge' | 'label' | 'node' | 'theme'> {
  const palette = mockThemeColors[graph.theme];
  const fills: Record<MockNodeGroup, string> = {
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
    neutral: palette.neutral,
  };

  return {
    theme: dark ? 'dark' : 'light',
    label: {
      scaleWithZoom: false,
      hideOnLowZoom: false,
      hideOnCollision: true,
    },
    node: {
      type: 'rect',
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        borderRadius: NODE_HEIGHT / 2,
        fill: (node) => fills[(node.data?.group as MockNodeGroup) ?? 'primary'],
        stroke: dark ? 'rgba(255, 255, 255, 0.72)' : '#ffffff',
        strokeWidth: 1.5,
        label: graph.showLabels ? (node) => String(node.data?.label ?? node.id) : () => false,
        labelPlacement: 'center',
        labelColor: (node) =>
          node.data?.group === 'neutral' ? '#334155' : dark ? '#f8fafc' : '#ffffff',
        labelFontSize: 11,
        labelFontWeight: '700',
      },
    },
    edge: {
      type: graph.layout === 'radial' ? 'line' : 'polyline',
      style: {
        stroke: palette.edge,
        lineWidth: 1.6,
        endArrow: true,
        radius: 14,
        label: graph.showLabels
          ? (_source, _target, edge) => String(edge.data?.label ?? '')
          : () => false,
        labelColor: dark ? '#cbd5e1' : '#64748b',
        labelFontSize: 10,
        labelBackground: dark ? 'rgba(15, 23, 42, 0.86)' : 'rgba(255, 255, 255, 0.88)',
        labelBackgroundPadding: 2.5,
        labelAutoRotate: graph.layout !== 'radial',
      },
    },
  };
}

export const AiNativeGraph = forwardRef<AiNativeGraphHandle, NativeGraphProps>(
  function AiNativeGraph({ graph, locale, onStatusChange }, ref) {
    const mountRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph | null>(null);
    const operationRef = useRef<Promise<void>>(Promise.resolve());
    const revisionRef = useRef(0);
    const destroyedRef = useRef(false);
    const { resolvedTheme } = useTheme();
    const dark = resolvedTheme === 'dark';
    const data = useMemo(() => toG6LiteGraphData(graph), [graph]);
    const layout = useMemo(() => getG6LiteLayoutConfig(graph), [graph]);
    const options = useMemo(() => visualOptions(graph, dark), [dark, graph]);

    useImperativeHandle(
      ref,
      () => ({
        fitView() {
          graphRef.current?.fitView({ padding: 72, maxZoom: 1.2 });
        },
      }),
      [],
    );

    useEffect(() => {
      destroyedRef.current = false;
      const mount = mountRef.current;
      return () => {
        destroyedRef.current = true;
        revisionRef.current += 1;
        const instance = graphRef.current;
        graphRef.current = null;
        instance?.destroy();
        mount?.replaceChildren();
      };
    }, []);

    useEffect(() => {
      const mount = mountRef.current;
      if (!mount) return;

      const revision = ++revisionRef.current;
      mount.dataset.graphStatus = 'loading';
      onStatusChange?.('loading');

      const syncGraph = async () => {
        if (destroyedRef.current || revision !== revisionRef.current) return;

        let instance = graphRef.current;
        if (!instance) {
          const { Graph: GraphConstructor } = await import('../../../src/index.ts');
          if (destroyedRef.current || revision !== revisionRef.current) return;

          mount.replaceChildren();
          instance = new GraphConstructor({
            autoFitOnResize: true,
            behaviors: [
              'zoom-canvas',
              'drag-canvas',
              'drag-node',
              'highlight-node',
              'highlight-edge',
            ],
            container: mount,
            data,
            edge: options.edge,
            label: options.label,
            layout: layout as LayoutConfig,
            node: options.node,
            theme: options.theme,
          });
          graphRef.current = instance;
          await instance.render();
          instance.fitView({ padding: 72, maxZoom: 1.2 });
        } else {
          instance.updateOptions(options);
          instance.setLayout(layout as LayoutConfig);
          await instance.setData(data, { fitView: { padding: 72, maxZoom: 1.2 } });
        }

        if (destroyedRef.current || revision !== revisionRef.current) return;

        const canvas = mount.querySelector('canvas');
        const hasWebGl = Boolean(canvas?.getContext('webgl2') ?? canvas?.getContext('webgl'));
        mount.dataset.graphEngine = 'g6lite';
        mount.dataset.graphRenderer = 'webgl';
        mount.dataset.graphWebgl = hasWebGl ? 'ready' : 'unavailable';
        mount.dataset.graphStatus = 'ready';
        mount.dataset.layout = graph.layout;
        mount.dataset.theme = graph.theme;
        mount.dataset.nodeCount = String(data.nodes.length);
        mount.dataset.edgeCount = String(data.edges.length);
        onStatusChange?.('ready');
      };

      operationRef.current = operationRef.current
        .catch(() => undefined)
        .then(syncGraph)
        .catch((reason: unknown) => {
          if (destroyedRef.current || revision !== revisionRef.current) return;
          const message = reason instanceof Error ? reason.message : String(reason);
          mount.dataset.graphStatus = 'error';
          onStatusChange?.('error', message);
        });
    }, [data, graph.layout, graph.theme, layout, onStatusChange, options]);

    const accessibleSummary =
      locale === 'zh'
        ? `${graph.title}，${graph.nodes.length} 个节点，${graph.edges.length} 条关系。${graph.summary}`
        : `${graph.title}, ${graph.nodes.length} nodes and ${graph.edges.length} relationships. ${graph.summary}`;

    return (
      <figure
        aria-label={accessibleSummary}
        className={styles.nativeGraph}
        style={{ '--native-graph-accent': mockThemeColors[graph.theme].primary } as CSSProperties}
      >
        <div className={styles.nativeGraphMount} ref={mountRef} />
        <figcaption className={styles.srOnly}>{accessibleSummary}</figcaption>
      </figure>
    );
  },
);
