import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { SiteFooter } from '@/components/site-footer';
import { headingFont } from '@/lib/site-font';
import { localizedPath, type Locale } from '@/lib/i18n';

import styles from './ai-skill-page.module.css';
import { aiSkillCopy, terminalText, type TerminalLine } from './content';
import { CopyPrompt } from './copy-prompt';

function Terminal({ lines, label }: { lines: TerminalLine[]; label: string }) {
  return (
    <div className={styles.terminal}>
      <div className={styles.terminalBar}>
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>{label}</span>
      </div>
      <pre>
        {lines.map((line, index) => {
          if (line.kind === 'blank') return <span key={`blank-${index}`}>{'\n'}</span>;
          const className =
            line.kind === 'comment'
              ? styles.comment
              : line.kind === 'quote'
                ? styles.quote
                : styles.command;
          return (
            <span key={`${line.kind}-${index}`} className={className}>
              {line.kind === 'command' ? <span className={styles.promptMark}>$ </span> : null}
              {line.text}
              {'\n'}
            </span>
          );
        })}
      </pre>
    </div>
  );
}

export function AiSkillPage({ locale }: { locale: Locale }) {
  const copy = aiSkillCopy[locale];

  return (
    <main
      className={`${styles.page} ${headingFont.variable}`}
      lang={locale === 'zh' ? 'zh-CN' : 'en'}
    >
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className={styles.subtitle}>{copy.description}</p>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.tab}>{copy.tab}</div>
            <CopyPrompt
              className={styles.copyButton}
              text={terminalText(copy.terminal)}
              label={copy.copy}
              copiedLabel={copy.copied}
              failedLabel={copy.copyFailed}
            />
          </div>
          <div className={styles.cardBody}>
            <div className={styles.cardCopy}>
              <h2>{copy.cardTitle}</h2>
              <p>{copy.cardBody}</p>
              <div className={styles.cardLinks}>
                <Link href={localizedPath('/docs/ai', locale)}>
                  {copy.readGuide} <ArrowUpRight aria-hidden="true" />
                </Link>
              </div>
            </div>
            <Terminal lines={copy.terminal} label={copy.terminalLabel} />
          </div>
        </div>
      </section>

      <section className={styles.usage}>
        <div className={styles.usageInner}>
          <h2>{copy.usageTitle}</h2>
          <ol>
            {copy.steps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <p className={styles.note}>{copy.note}</p>
        </div>
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}
