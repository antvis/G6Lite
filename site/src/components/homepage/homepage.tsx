import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Cpu,
  Database,
  MousePointer2,
  Network,
  Package,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { codeToHtml } from 'shiki';

import { AntVLogo } from '@/components/antv-logo';
import { siteConfig } from '@/lib/site-config';
import { localizedPath, type Locale } from '@/lib/i18n';

import styles from './homepage.module.css';
import { homepageCopy } from './content';
import { ScrollNavigation } from './scroll-navigation';
import bundleMeasurement from './bundle-measurement.json';
import { HomepageArchitecture } from './homepage-architecture';
import { FeaturedExamples } from './featured-examples';
import { HeroLiveGraph } from './hero-live-graph';
import { UpdateScenarios } from './update-scenarios';

const headingFont = localFont({
  src: './fonts/heading-medium.woff2',
  weight: '500',
  display: 'swap',
  variable: '--font-homepage-heading',
  adjustFontFallback: false,
});

function Github() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.45-1.15-1.11-1.45-1.11-1.45-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.82.09-.65.35-1.08.64-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.58 9.58 0 0 1 12 6.83c.85 0 1.71.12 2.51.35 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.39.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.58 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

const quickStartCode = `import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: 'graph',
  data: {
    nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    edges: [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'c' },
    ],
  },
  layout: { type: 'circular', radius: 140 },
  behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
});

await graph.render();`;

const stageIcons = [Database, Network, Cpu, MousePointer2];

export async function Homepage({ locale = 'zh' }: { locale?: Locale }) {
  const copy = homepageCopy[locale];
  const code = await codeToHtml(quickStartCode, { lang: 'ts', theme: 'github-dark' });

  return (
    <main
      className={`${styles.page} ${headingFont.variable}`}
      lang={locale === 'zh' ? 'zh-CN' : 'en'}
    >
      <ScrollNavigation />
      <HeroStage locale={locale} />

      <section className={styles.section} id="workflow">
        <div className={styles.shell}>
          <SectionHeading
            title={copy.workflow.title}
            align="left"
            descriptionClassName={styles.workflowDescription}
          >
            {copy.workflow.description}{' '}
            <Link
              className={styles.workflowLifecycleLink}
              href={localizedPath('/docs/concepts/graph-lifecycle', locale)}
            >
              {copy.workflow.lifecycle} <ArrowRight aria-hidden="true" />
            </Link>
          </SectionHeading>
          <div className={styles.workflowGrid}>
            {copy.workflow.stages.map((stage, index) => {
              const Icon = stageIcons[index];
              return (
                <article className={styles.workflowCard} key={stage.title}>
                  <div className={styles.stageHeading}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <Icon aria-hidden="true" />
                  </div>
                  <h3>{stage.title}</h3>
                  <p>{stage.description}</p>
                  <WorkflowVisual stage={index} locale={locale} />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.performanceBand}`} id="performance">
        <div className={styles.shell}>
          <SectionHeading title={copy.performance.title} align="left">
            {copy.performance.description}
          </SectionHeading>
          <div className={styles.advantagesGrid}>
            <article className={styles.advantageCard}>
              <h3>
                <Package aria-hidden="true" /> {copy.performance.loadTitle}
              </h3>
              <p>{copy.performance.loadDescription}</p>
              <div className={styles.advantageVisual}>
                <div className={styles.measuredSize}>
                  <span>{copy.performance.measured}</span>
                  <strong>
                    {(bundleMeasurement.initialBytes / bundleMeasurement.unitBytes).toFixed(1)}
                    <small>kB</small>
                  </strong>
                  <span>
                    {bundleMeasurement.compression} · {copy.performance.noLayouts}
                  </span>
                </div>
                <div className={styles.loadParts}>
                  <span>{copy.performance.core}</span>
                  <span>{copy.performance.lazyLayouts}</span>
                </div>
                <span className={styles.visualCaption}>
                  v{bundleMeasurement.version} · {bundleMeasurement.measuredAt}
                </span>
              </div>
              <Link
                className={styles.advantageLink}
                href={localizedPath('/docs/metrics/bundle-size', locale)}
              >
                {copy.performance.sizeLink} <ArrowRight aria-hidden="true" />
              </Link>
            </article>
            <article className={styles.advantageCard}>
              <h3>
                <Cpu aria-hidden="true" /> {copy.performance.batchTitle}
              </h3>
              <p>{copy.performance.batchDescription}</p>
              <div className={`${styles.advantageVisual} ${styles.batchVisual}`}>
                <div className={styles.batchFlow}>
                  <div className={styles.batchSources}>
                    <div>
                      <span>{copy.performance.nodes}</span>
                      <div className={styles.batchDots} aria-hidden="true">
                        {Array.from({ length: 8 }, (_, index) => (
                          <i key={index} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <span>{copy.performance.edges}</span>
                      <div className={styles.batchLines} aria-hidden="true">
                        {Array.from({ length: 4 }, (_, index) => (
                          <i key={index} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <ArrowRight aria-hidden="true" />
                  <div className={styles.batchTarget}>
                    <Cpu aria-hidden="true" />
                    <strong>WebGL</strong>
                    <span>{copy.performance.batches}</span>
                  </div>
                </div>
                <span className={styles.visualCaption}>{copy.performance.batchCaption}</span>
              </div>
              <Link
                className={styles.advantageLink}
                href={localizedPath('/docs/concepts/architecture', locale)}
              >
                {copy.performance.architectureLink} <ArrowRight aria-hidden="true" />
              </Link>
            </article>
            <article className={styles.advantageCard}>
              <h3>
                <Zap aria-hidden="true" /> {copy.performance.updateTitle}
              </h3>
              <p>{copy.performance.updateDescription}</p>
              <div className={styles.advantageVisual}>
                <UpdateScenarios locale={locale} />
              </div>
              <Link
                className={styles.advantageLink}
                href={localizedPath('/docs/metrics/performance-tuning', locale)}
              >
                {copy.performance.tuning} <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          </div>
          <p className={styles.advantageFootnote}>
            {copy.performance.footnote}
            <Link href={localizedPath('/docs/metrics/performance', locale)}>
              {copy.performance.method} <ArrowRight aria-hidden="true" />
            </Link>
          </p>
        </div>
      </section>

      <section className={styles.section} id="scenarios">
        <div className={styles.shell}>
          <SectionHeading title={copy.examples.title} align="left">
            {copy.examples.description}
          </SectionHeading>
          <FeaturedExamples locale={locale} />
        </div>
      </section>

      <section className={`${styles.section} ${styles.developerBand}`} id="developers">
        <div className={styles.shell}>
          <div className={styles.developerBody}>
            <div className={styles.developerCopy}>
              <span className={styles.eyebrow}>{copy.developer.label}</span>
              <h2 className={styles.developerTitle}>
                {copy.developer.first}
                {locale === 'en' && ' '}
                <br />
                {copy.developer.second}
              </h2>
              <p>{copy.developer.description}</p>
              <Link
                className={styles.textLink}
                href={localizedPath('/docs/getting-started/quick-start', locale)}
              >
                {copy.actions.readStart} <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <figure className={styles.codePanel} aria-label={copy.developer.codeLabel}>
              <figcaption className={styles.codeWindowMarks}>
                <span aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <small>graph.ts</small>
              </figcaption>
              <div className={styles.highlightedCode} dangerouslySetInnerHTML={{ __html: code }} />
            </figure>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.architectureBand}`}
        id="architecture"
        aria-labelledby="architecture-title"
      >
        <div className={styles.shell}>
          <div className={styles.architectureHeading}>
            <h2 id="architecture-title">{copy.architecture.title}</h2>
            <p>{copy.architecture.description}</p>
            <Link
              className={styles.textLink}
              href={localizedPath('/docs/concepts/architecture', locale)}
            >
              {copy.architecture.link} <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <HomepageArchitecture locale={locale} />
        </div>
      </section>

      <section className={styles.finalCta}>
        <h2>{copy.cta.title}</h2>
        <p>{copy.cta.description}</p>
        <div className={styles.actions}>
          <Link
            className={styles.primaryButton}
            href={localizedPath('/docs/getting-started/quick-start', locale)}
          >
            {copy.actions.start} <ArrowRight />
          </Link>
          <Link className={styles.secondaryButton} href={siteConfig.repository}>
            <Github /> {copy.actions.github}
          </Link>
        </div>
      </section>
      <HomepageFooter locale={locale} />
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children,
  descriptionClassName,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  descriptionClassName?: string;
  align?: 'center' | 'left';
}) {
  return (
    <header className={`${styles.sectionHeading} ${align === 'left' ? styles.alignLeft : ''}`}>
      {eyebrow && <span>{eyebrow}</span>}
      <h2>{title}</h2>
      <p className={descriptionClassName}>{children}</p>
    </header>
  );
}

function HeroStage({ locale }: { locale: Locale }) {
  const copy = homepageCopy[locale];
  return (
    <section className={styles.hero}>
      <div className={styles.heroIntro}>
        <div className={styles.heroLead}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true">●</span> G6Lite · WebGL Graph Engine
          </p>
          <h1>
            {copy.hero.before}
            {locale === 'en' && ' '}
            <br />
            {copy.hero.prefix}
            <span>{copy.hero.highlight}</span>
            {copy.hero.after}
          </h1>
          <div className={styles.heroAside}>
            <p className={styles.heroDescription}>{copy.hero.description}</p>
            <div className={styles.actions}>
              <Link
                className={styles.secondaryButton}
                href={localizedPath('/docs/getting-started/quick-start', locale)}
              >
                {copy.actions.start} <ArrowRight />
              </Link>
              <Link className={styles.primaryButton} href={localizedPath('/ai', locale)}>
                <Bot aria-hidden="true" /> {copy.actions.ai} <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                className={styles.heroExampleLink}
                href={localizedPath('/docs/examples', locale)}
              >
                {copy.actions.examples} <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.productWindow}>
          <div className={styles.heroCanvas}>
            <HeroLiveGraph locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowVisual({ stage, locale }: { stage: number; locale: Locale }) {
  const copy = homepageCopy[locale];
  if (stage === 0)
    return (
      <div className={styles.dataVisual}>
        <div>
          <i /> nodes <span>[ a, b, c ]</span>
        </div>
        <div>
          <i /> edges <span>[ a → b, a → c ]</span>
        </div>
        <div>
          <i /> combos <span>[ group ]</span>
        </div>
      </div>
    );
  if (stage === 2)
    return (
      <div className={styles.layerVisual}>
        <div>{copy.workflow.layers[0]}</div>
        <div>{copy.workflow.layers[1]}</div>
        <div>{copy.workflow.layers[2]}</div>
      </div>
    );
  return (
    <svg className={styles.miniGraph} aria-hidden="true" viewBox="0 0 240 130">
      <g>
        <path
          d={
            stage === 1
              ? 'M42 65 90 24 155 30 202 65 155 106 90 106Z'
              : 'M38 80 97 34 144 76 204 38M38 80 95 110 144 76 202 107'
          }
        />
      </g>
      <g>
        {(stage === 1
          ? [
              [42, 65],
              [90, 24],
              [155, 30],
              [202, 65],
              [155, 106],
              [90, 106],
            ]
          : [
              [38, 80],
              [97, 34],
              [144, 76],
              [204, 38],
              [95, 110],
              [202, 107],
            ]
        ).map(([x, y], index) => (
          <circle key={index} cx={x} cy={y} r={stage === 3 && index === 2 ? 9 : 6} />
        ))}
      </g>
      {stage === 3 && <circle className={styles.pickRing} cx="144" cy="76" r="17" />}
    </svg>
  );
}

function HomepageFooter({ locale }: { locale: Locale }) {
  const copy = homepageCopy[locale].footer;
  const groups = [
    {
      title: copy.groups[0],
      labels: copy.product,
      hrefs: ['#workflow', '#scenarios', localizedPath('/ai', locale)],
    },
    {
      title: copy.groups[1],
      labels: copy.developer,
      hrefs: [
        localizedPath('/docs', locale),
        localizedPath('/docs/getting-started/quick-start', locale),
        localizedPath('/docs/api', locale),
      ],
    },
    {
      title: copy.groups[2],
      labels: copy.community,
      hrefs: [
        siteConfig.repository,
        siteConfig.repository + '/issues',
        localizedPath('/docs/changelog', locale),
      ],
    },
    {
      title: copy.groups[3],
      labels: ['AntV', 'G6', 'AVA'],
      hrefs: [
        'https://antv.antgroup.com/',
        'https://g6.antv.antgroup.com/',
        'https://ava.antv.vision/',
      ],
    },
  ];
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <span>
              <AntVLogo />
              <i /> G6Lite
            </span>
            <p>{copy.description}</p>
            <Link href={localizedPath('/', locale)}>
              {copy.home} <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              {group.labels.map((label, index) => (
                <Link href={group.hrefs[index]} key={label}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
