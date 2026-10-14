import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { withBasePath } from '@/lib/shared';
import { localizedPath, type Locale } from '@/lib/i18n';

import styles from './homepage.module.css';
import { homepageCopy } from './content';

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
      {examples.map((example, index) => (
        <article key={example.id}>
          <Link
            className={styles.featuredCard}
            href={localizedPath(`/docs/examples/${example.id}`, locale)}
            aria-label={`${copy.open}${copy.items[index].title}${copy.openSuffix}`}
            prefetch={false}
          >
            <div className={styles.featuredImage}>
              <Image
                src={withBasePath(`/homepage/examples/${example.image}.png`)}
                alt={`${copy.items[index].title} ${copy.screenshot}`}
                fill
                sizes="(min-width: 1280px) 272px, (min-width: 1024px) 22vw, (min-width: 360px) 44vw, 90vw"
              />
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
      ))}
    </div>
  );
}
