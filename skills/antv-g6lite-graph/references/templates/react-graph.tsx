'use client';

import { useEffect, useRef, useState } from 'react';
import { Graph, type GraphData, type NodeGraphEvent } from '@antv/g6-lite';

type Props = {
  data: GraphData;
  onNodeClick?: (nodeId: string) => void;
};

type Runtime = {
  graph: Graph;
  pending: Promise<void>;
  revision: number;
  hasData: boolean;
};

// Pass immutable data snapshots: <RelationshipGraph data={data} onNodeClick={openDetails} />.
// The host application needs React and @antv/g6-lite; no repository demo helpers are used.
export function RelationshipGraph({ data, onNodeClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<Runtime | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let graph: Graph;
    try {
      graph = new Graph({
        container: containerRef.current,
        data: { nodes: [], edges: [] },
        node: {
          style: {
            size: 32,
            fill: '#2563eb',
            label: (node) => node.name ?? node.id,
            labelPlacement: 'bottom',
            labelOffsetY: 8,
            labelColor: '#334155',
          },
          stateStyles: {
            selected: { stroke: '#7c3aed', strokeWidth: 3 },
            highlight: { stroke: '#f59e0b', strokeWidth: 3 },
            inactive: { opacity: 0.2 },
          },
        },
        edge: {
          style: { stroke: '#94a3b8', endArrow: true, arrowSize: 6 },
          stateStyles: { inactive: { opacity: 0.15 } },
        },
        layout: { type: 'dagre', rankdir: 'LR', ranksep: 100 },
        behaviors: [
          'zoom-canvas',
          'drag-canvas',
          'drag-node',
          'click-select',
          { type: 'hover-highlight', inactiveState: 'inactive' },
        ],
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return;
    }

    const runtime: Runtime = {
      graph,
      pending: Promise.resolve(),
      revision: 0,
      hasData: false,
    };
    runtimeRef.current = runtime;
    runtime.pending = graph.render().catch((cause: unknown) => {
      if (!graph.destroyed) {
        setError(cause instanceof Error ? cause.message : String(cause));
        graph.destroy();
      }
    });

    return () => {
      runtimeRef.current = null;
      graph.destroy();
    };
  }, []);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const { graph } = runtime;
    const revision = ++runtime.revision;
    // Wait for initialization/previous writes; skip superseded pending snapshots.
    runtime.pending = runtime.pending.then(async () => {
      if (graph.destroyed || revision !== runtime.revision) return;
      try {
        await graph.setData(data, {
          fitView: runtime.hasData ? false : { padding: 48 },
        });
        if (graph.destroyed) return;
        // An initially empty response must not consume the first content fit.
        runtime.hasData = runtime.hasData || data.nodes.length > 0;
        if (revision === runtime.revision) setError(null);
      } catch (cause) {
        if (!graph.destroyed && revision === runtime.revision) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      }
    });
  }, [data]);

  useEffect(() => {
    const graph = runtimeRef.current?.graph;
    if (!graph) return;
    const handleClick = ({ nodeId }: NodeGraphEvent) => onNodeClick?.(nodeId);
    graph.on('node:click', handleClick);
    return () => graph.off('node:click', handleClick);
  }, [onNodeClick]);

  return (
    <section aria-label="Relationship graph">
      {error && <p role="alert">Unable to display graph: {error}</p>}
      {data.nodes.length === 0 && !error && <p role="status">No graph data.</p>}
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: 480 }} />
    </section>
  );
}
