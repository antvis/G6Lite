'use client';

import { useState } from 'react';

import type { Locale } from '@/lib/i18n';
import styles from './homepage.module.css';
import { homepageCopy } from './content';

type Scenario = 'highlight' | 'position' | 'viewport';
const scenarioIds: Scenario[] = ['highlight', 'position', 'viewport'];
const centers = [
  { x: 85, y: 55 },
  { x: 222, y: 58 },
  { x: 103, y: 134 },
  { x: 224, y: 132 },
];
const clusterSize = 16;
const nodes = centers.flatMap((center, cluster) => [
  center,
  ...Array.from({ length: clusterSize - 1 }, (_, index) => {
    const angle = (index / (clusterSize - 1)) * Math.PI * 2 + cluster * 0.6;
    const radius = 21 + (index % 3) * 10;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius * 0.8,
    };
  }),
]);
const edges = centers.flatMap((_, cluster) => {
  const hub = cluster * clusterSize;
  return Array.from({ length: clusterSize - 1 }, (_, index) => {
    const node = hub + index + 1;
    const next = hub + ((index + 1) % (clusterSize - 1)) + 1;
    return [[hub, node], [node, next]];
  }).flat();
});
edges.push([0, 16], [0, 32], [16, 48], [32, 48], [0, 48], [16, 32]);
const neighbors = new Set(
  edges.flatMap(([from, to]) => (from === 0 ? [to] : to === 0 ? [from] : [])),
);

/** Mechanism illustration only: no second WebGL graph and no invented timing. */
export function UpdateScenarios({ locale }: { locale: Locale }) {
  const copy = homepageCopy[locale].update;
  const scenarios = copy.scenarios.map((item, index) => ({ ...item, id: scenarioIds[index] }));
  const [scenario, setScenario] = useState<Scenario>('highlight');
  const points = nodes.map((node, index) =>
    scenario === 'position' && index === 0 ? { x: node.x + 22, y: node.y - 12 } : node,
  );
  const current = scenarios.find((item) => item.id === scenario) ?? scenarios[0];

  return (
    <div className={styles.updateDemo} data-update-scenario={scenario}>
      <div className={styles.updateControls} role="group" aria-label={copy.group}>
        {scenarios.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={scenario === item.id}
            onClick={() => setScenario(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <svg
        className={styles.updateIllustration}
        viewBox="0 0 310 190"
        role="img"
        aria-label={`${current.label}${locale === 'en' ? ' ' : ''}${copy.illustration}`}
      >
        <g
          transform={
            scenario === 'viewport'
              ? 'translate(155 95) scale(1.12) translate(-155 -95)'
              : undefined
          }
        >
          {scenario === 'position' && (
            <circle cx={nodes[0].x} cy={nodes[0].y} r={8} className={styles.previousPosition} />
          )}
          {edges.map(([from, to]) => (
            <line
              key={`${from}-${to}`}
              x1={points[from].x}
              y1={points[from].y}
              x2={points[to].x}
              y2={points[to].y}
              className={
                (from === 0 || to === 0) && scenario !== 'viewport'
                  ? styles.updatedEdge
                  : styles.illustrationEdge
              }
            />
          ))}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={index === 0 ? 6 : index % clusterSize === 0 ? 4.5 : 2.6}
              className={
                index === 0 && scenario !== 'viewport'
                  ? styles.updatedNode
                  : scenario === 'highlight' && neighbors.has(index)
                    ? styles.neighborNode
                    : styles.illustrationNode
              }
            />
          ))}
          {scenario === 'highlight' && (
            <circle cx={points[0].x} cy={points[0].y} r={12} className={styles.highlightHalo} />
          )}
        </g>
      </svg>
      <p className={styles.updateDetail} role="status">
        {current.detail}
      </p>
      <span className={styles.visualCaption}>{copy.caption}</span>
    </div>
  );
}
