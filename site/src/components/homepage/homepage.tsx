import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Cpu,
  Database,
  MousePointer2,
  Network,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/site-footer';
import { CopyPrompt } from '@/components/ai-skill/copy-prompt';
import { skillName } from '@/components/ai-skill/content';
import { localizedPath, type Locale } from '@/lib/i18n';
import { headingFont } from '@/lib/site-font';

import styles from './homepage.module.css';
import { homepageCopy } from './content';
import { ScrollNavigation } from './scroll-navigation';
import bundleMeasurement from './bundle-measurement.json';
import { HomepageArchitecture } from './homepage-architecture';
import { FeaturedExamples } from './featured-examples';
import { HeroLiveGraph } from './hero-live-graph';
import { UpdateScenarios } from './update-scenarios';

const stageIcons = [Database, Network, Cpu, MousePointer2];

export async function Homepage({ locale = 'zh' }: { locale?: Locale }) {
  const copy = homepageCopy[locale];
  const aiPrompt = `${locale === 'zh' ? '使用' : 'Use'} $${skillName}\n${copy.performance.aiRequest}`;

  return (
    <main
      data-g6lite-homepage
      className={`${styles.page} ${headingFont.variable}`}
      lang={locale === 'zh' ? 'zh-CN' : 'en'}
    >
      <ScrollNavigation />
      <HeroStage locale={locale} />

      <section className={styles.section} id="workflow">
        <div className={styles.shell}>
          <SectionHeading
            title={copy.workflow.title}
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
          <SectionHeading title={copy.performance.title}>
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
                <Cpu aria-hidden="true" /> {copy.performance.interactionTitle}
              </h3>
              <p>{copy.performance.interactionDescription}</p>
              <div className={`${styles.advantageVisual} ${styles.interactionVisual}`}>
                <div className={styles.renderingMechanisms}>
                  <span>
                    <Cpu aria-hidden="true" />
                    {copy.performance.batchRendering}
                  </span>
                  <span>{copy.performance.incrementalUpdates}</span>
                </div>
                <UpdateScenarios locale={locale} />
              </div>
              <Link
                className={styles.advantageLink}
                href={localizedPath('/docs/metrics/performance', locale)}
              >
                {copy.performance.tuning} <ArrowRight aria-hidden="true" />
              </Link>
            </article>
            <article className={styles.advantageCard}>
              <h3>
                <Bot aria-hidden="true" /> {copy.performance.aiTitle}
              </h3>
              <p>{copy.performance.aiDescription}</p>
              <div className={`${styles.advantageVisual} ${styles.skillVisual}`}>
                <div className={styles.skillBar}>
                  <span>Agent Skill</span>
                  <CopyPrompt
                    text={aiPrompt}
                    label={copy.performance.copyPrompt}
                    copiedLabel={copy.performance.copiedPrompt}
                    failedLabel={copy.performance.copyFailed}
                    className={styles.skillCopy}
                  />
                </div>
                <div className={styles.skillRequest}>
                  <code>${skillName}</code>
                  <p>{copy.performance.aiRequest}</p>
                </div>
                <ArrowRight className={styles.skillFlowArrow} aria-hidden="true" />
                <div className={styles.skillResult}>
                  <Network aria-hidden="true" />
                  <div>
                    <strong>{copy.performance.aiResult}</strong>
                    <span>{copy.performance.aiResultDetail}</span>
                  </div>
                </div>
                <span className={styles.visualCaption}>{copy.performance.aiCaption}</span>
              </div>
              <Link className={styles.advantageLink} href={localizedPath('/ai', locale)}>
                {copy.performance.aiLink} <ArrowRight aria-hidden="true" />
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

      <section className={`${styles.section} ${styles.showcaseBand}`} id="scenarios">
        <div className={styles.shell}>
          <SectionHeading title={copy.examples.title} eyebrow={copy.examples.eyebrow}>
            {copy.examples.description}
          </SectionHeading>
          <FeaturedExamples locale={locale} />
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
        <HomepageActions locale={locale} />
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}

function HomepageActions({ locale }: { locale: Locale }) {
  const copy = homepageCopy[locale];
  return (
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
      <Link className={styles.heroExampleLink} href={localizedPath('/docs/examples', locale)}>
        {copy.actions.examples} <ArrowUpRight aria-hidden="true" />
      </Link>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children,
  descriptionClassName,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  descriptionClassName?: string;
}) {
  return (
    <header className={styles.sectionHeading}>
      {eyebrow && <span>{eyebrow}</span>}
      <h2>{title}</h2>
      <p className={descriptionClassName}>{children}</p>
    </header>
  );
}

function HeroStage({ locale }: { locale: Locale }) {
  const copy = homepageCopy[locale];
  const [, statement] = copy.hero.before.split(' · ');
  return (
    <section className={styles.hero}>
      <div className={styles.heroIntro}>
        <div className={styles.heroLead}>
          <h1>
            <span className={styles.heroTagline}>
              <span className={styles.heroClaim}>{statement}</span>
              {locale === 'en' && ' '}
              <span className={styles.heroClaim}>
                {copy.hero.prefix}
                <span className={styles.heroHighlight}>{copy.hero.highlight}</span>
                {copy.hero.after}
              </span>
            </span>
          </h1>
          <div className={styles.heroAside}>
            <p className={styles.heroDescription}>{copy.hero.description}</p>
            <HomepageActions locale={locale} />
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
