import { ArrowDown } from 'lucide-react';

import type { Locale } from '@/lib/i18n';
import styles from './homepage.module.css';
import { homepageCopy } from './content';

/** A static responsibility map, not a sequential runtime trace or renderer picker. */
export function HomepageArchitecture({ locale }: { locale: Locale }) {
  const copy = homepageCopy[locale].architecture;
  return (
    <figure className={styles.architectureFigure} aria-label={copy.figure}>
      <div className={styles.architectureRow}>
        <span className={styles.architectureRowLabel}>{copy.rows[0]}</span>
        <div className={styles.architectureConsumer}>
          <strong>{copy.consumer}</strong>
          <span>Web · React · Vue</span>
        </div>
      </div>
      <div className={styles.architectureConnector} aria-hidden="true">
        <ArrowDown />
      </div>
      <div className={styles.architectureRow}>
        <span className={styles.architectureRowLabel}>{copy.rows[1]}</span>
        <div className={styles.architectureApi}>
          <strong>Graph API</strong>
          <span>{copy.api}</span>
        </div>
      </div>
      <div className={styles.architectureConnector} aria-hidden="true">
        <ArrowDown />
      </div>
      <div className={styles.architectureRow}>
        <span className={styles.architectureRowLabel}>{copy.rows[2]}</span>
        <div className={styles.architectureResponsibilities}>
          {copy.responsibilities.map((item) => (
            <div key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.architectureConnector} aria-hidden="true">
        <ArrowDown />
      </div>
      <div className={styles.architectureRow}>
        <span className={styles.architectureRowLabel}>{copy.rows[3]}</span>
        <div className={styles.architectureLayers}>
          <div data-render-layer="overlay">
            <span>{copy.layerNames[0]}</span>
            <strong>Canvas 2D</strong>
            <p>{copy.layerDetails[0]}</p>
          </div>
          <div data-render-layer="main">
            <span>{copy.layerNames[1]}</span>
            <strong>WebGL</strong>
            <p>{copy.layerDetails[1]}</p>
          </div>
          <div data-render-layer="underlay">
            <span>{copy.layerNames[2]}</span>
            <strong>Canvas 2D</strong>
            <p>{copy.layerDetails[2]}</p>
          </div>
        </div>
      </div>
      <figcaption>{copy.caption}</figcaption>
    </figure>
  );
}
