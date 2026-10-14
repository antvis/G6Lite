'use client';

import { useState } from 'react';

import type { Locale } from '@/lib/i18n';
import styles from './homepage.module.css';
import { homepageCopy } from './content';

type Scenario = 'highlight' | 'position' | 'viewport';
const scenarioIds: Scenario[] = ['highlight', 'position', 'viewport'];
const nodes = [
  { x: 48, y: 44 },
  { x: 140, y: 88 },
  { x: 99, y: 145 },
  { x: 246, y: 39 },
  { x: 257, y: 140 },
  { x: 48, y: 158 },
];
const edges = [
  [0, 1],
  [1, 2],
  [1, 3],
  [1, 4],
  [2, 5],
  [3, 4],
];

/** Mechanism illustration only: no second WebGL graph and no invented timing. */
export function UpdateScenarios({ locale }: { locale: Locale }) {
  const copy = homepageCopy[locale].update;
  const scenarios = copy.scenarios.map((item, index) => ({ ...item, id: scenarioIds[index] }));
  const [scenario, setScenario] = useState<Scenario>('highlight');
  const points = nodes.map((node, index) =>
    scenario === 'position' && index === 1 ? { x: 166, y: 62 } : node,
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
            <circle cx={140} cy={88} r={11} className={styles.previousPosition} />
          )}
          {edges.map(([from, to]) => (
            <line
              key={`${from}-${to}`}
              x1={points[from].x}
              y1={points[from].y}
              x2={points[to].x}
              y2={points[to].y}
              className={
                (from === 1 || to === 1) && scenario !== 'viewport'
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
              r={index === 1 ? 10 : 6}
              className={
                index === 1 && scenario !== 'viewport'
                  ? styles.updatedNode
                  : scenario === 'highlight' && index !== 5
                    ? styles.neighborNode
                    : styles.illustrationNode
              }
            />
          ))}
          {scenario === 'highlight' && (
            <circle cx={points[1].x} cy={points[1].y} r={18} className={styles.highlightHalo} />
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
