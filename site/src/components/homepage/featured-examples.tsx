import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { withBasePath } from '@/lib/shared';
import { localizedPath, type Locale } from '@/lib/i18n';

import styles from './homepage.module.css';
import { homepageCopy } from './content';
import cropRecords from '../../../public/homepage/examples/crop-records.json';

const examples = [
  {
    id: 'relationship',
    image: 'network',
  },
  {
    id: 'org-chart',
    image: 'hierarchy',
  },
  { id: 'mindmap', image: 'mindmap' },
  {
    id: 'fishbone',
    image: 'fishbone',
  },
] as const;

/** Homepage thumbnails link directly to the matching runnable example details. */
export function FeaturedExamples({ locale }: { locale: Locale }) {
  const copy = homepageCopy[locale].examples;
  return (
    <div className={styles.featuredGrid}>
      {examples.map((example, index) => {
        const crop = cropRecords[example.image];
        const [left, top] = crop.crop;
        return (
          <article key={example.id}>
            <Link
              className={styles.featuredCard}
              href={localizedPath(`/docs/examples/${example.id}`, locale)}
              aria-label={`${copy.open}${copy.items[index].title}${copy.openSuffix}`}
              prefetch={false}
            >
              <div className={styles.featuredImage}>
                <div
                  className={styles.featuredCrop}
                  style={{ '--crop-ratio': crop.width / crop.height } as CSSProperties}
                >
                  <Image
                    src={withBasePath(`/examples/${example.id}.png`)}
                    alt={`${copy.items[index].title} ${copy.screenshot}`}
                    width={1920}
                    height={1200}
                    style={{
                      width: `${(1920 / crop.width) * 100}%`,
                      height: `${(1200 / crop.height) * 100}%`,
                      left: `${(-left / crop.width) * 100}%`,
                      top: `${(-top / crop.height) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className={styles.featuredContent}>
                <div className={styles.featuredTitleRow}>
                  <h3>{copy.items[index].title}</h3>
                  <span className={styles.featuredAction} aria-hidden="true">
                    <span className={styles.featuredActionLabel}>{copy.entry}</span>
                    <ArrowUpRight />
                  </span>
                </div>
                <p>{copy.items[index].description}</p>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
