'use client';

import { useTheme } from 'fumadocs-ui/provider/base';
import { ArrowUpRight, LoaderCircle, Minus, Plus, RotateCcw, Scan } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import type { Graph } from '../../../../src/index.ts';
import { CopyPrompt } from '@/components/ai-skill/copy-prompt';
import { localizedPath, type Locale } from '@/lib/i18n';
import { homepageCopy } from './content';
import styles from './homepage.module.css';
import { showcaseOptions, type ShowcaseId } from './showcase-examples';

type Example = { id: ShowcaseId; light: string; dark: string; lightHtml: string; darkHtml: string };

export function ExampleShowcase({ locale, examples }: { locale: Locale; examples: Example[] }) {
  const copy = homepageCopy[locale].examples;
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  const mountRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [active, setActive] = useState<ShowcaseId>('relationship');
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'waiting' | 'loading' | 'ready' | 'error'>('waiting');
  const selected = examples.find((example) => example.id === active) ?? examples[0];
  const index = examples.indexOf(selected);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let graph: Graph | undefined;
    const start = async () => {
      setStatus('loading');
      try {
        const { Graph } = await import('../../../../src/index.ts');
        if (disposed) return;
        graph = new Graph({ container: mount, ...showcaseOptions(active, locale, dark) });
        graphRef.current = graph;
        await graph.render();
        if (disposed) return;
        setStatus('ready');
      } catch {
        if (disposed) return;
        graph?.destroy();
        graphRef.current = null;
        setStatus('error');
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void start();
      },
      { rootMargin: '160px' },
    );
    observer.observe(mount);
    return () => {
      disposed = true;
      observer.disconnect();
      graph?.destroy();
      if (graphRef.current === graph) graphRef.current = null;
    };
  }, [active, locale, dark, attempt]);

  function select(id: ShowcaseId) {
    if (id === active) return;
    setStatus('loading');
    setActive(id);
  }

  return (
    <div className={styles.showcase} id="developers">
      <div className={styles.showcaseHeader}>
        <div className={styles.showcaseTabs} role="tablist" aria-label={copy.tabs}>
          {examples.map((example, exampleIndex) => (
            <button
              type="button"
              role="tab"
              key={example.id}
              id={`showcase-tab-${example.id}`}
              aria-selected={active === example.id}
              aria-controls="showcase-panel"
              tabIndex={active === example.id ? 0 : -1}
              onClick={() => select(example.id)}
              onKeyDown={(event) => {
                const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
                if (!offset && event.key !== 'Home' && event.key !== 'End') return;
                event.preventDefault();
                const next =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? examples.length - 1
                      : (exampleIndex + offset + examples.length) % examples.length;
                select(examples[next].id);
                document.getElementById(`showcase-tab-${examples[next].id}`)?.focus();
              }}
            >
              {copy.items[exampleIndex].title}
            </button>
          ))}
        </div>
        <CopyPrompt
          key={`${active}-${dark}`}
          text={dark ? selected.dark : selected.light}
          label={copy.copy}
          copiedLabel={copy.copied}
          failedLabel={copy.copyFailed}
          className={styles.showcaseCopy}
        />
      </div>
      <div
        className={styles.showcaseWorkspace}
        role="tabpanel"
        id="showcase-panel"
        aria-labelledby={`showcase-tab-${active}`}
      >
        <div
          className={styles.showcasePreview}
          data-showcase-status={status}
          data-showcase-id={active}
        >
          <div className={styles.showcasePreviewHeading}>
            <div>
              <h3>{copy.items[index].title}</h3>
              <Link href={localizedPath(`/docs/examples/${active}`, locale)} prefetch={false}>
                {copy.entry}
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
            <p>{copy.items[index].description}</p>
          </div>
          <div
            className={styles.showcaseCanvas}
            ref={mountRef}
            role="img"
            aria-label={`${copy.items[index].title} · ${copy.graphLabel}`}
          />
          {status !== 'ready' && (
            <div className={styles.showcaseStatus} role="status">
              {status === 'error' ? (
                <button type="button" onClick={() => setAttempt((value) => value + 1)}>
                  {copy.retry}
                </button>
              ) : (
                <>
                  <LoaderCircle aria-hidden="true" />
                  {copy.loading}
                </>
              )}
            </div>
          )}
          <div className={styles.showcaseToolbar}>
            <span>
              <i data-ready={status === 'ready'} />
              {copy.hint}
            </span>
            <div>
              <button
                type="button"
                title={copy.zoomOut}
                aria-label={copy.zoomOut}
                disabled={status !== 'ready'}
                onClick={() => graphRef.current?.zoomBy(0.8)}
              >
                <Minus aria-hidden="true" />
              </button>
              <button
                type="button"
                title={copy.zoomIn}
                aria-label={copy.zoomIn}
                disabled={status !== 'ready'}
                onClick={() => graphRef.current?.zoomBy(1.25)}
              >
                <Plus aria-hidden="true" />
              </button>
              <button
                type="button"
                title={copy.reset}
                aria-label={copy.reset}
                onClick={() => {
                  setStatus('loading');
                  setAttempt((value) => value + 1);
                }}
              >
                <RotateCcw aria-hidden="true" />
              </button>
              <button
                type="button"
                title={copy.fit}
                aria-label={copy.fit}
                disabled={status !== 'ready'}
                onClick={() => graphRef.current?.fitView({ padding: 24 })}
              >
                <Scan aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div className={styles.showcaseCode}>
          <div className={styles.showcaseCodeBar}>
            <span>
              <span className={styles.showcaseWindowDots} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              {active}.ts
            </span>
          </div>
          <div
            key={`${active}-${dark}`}
            className={styles.showcaseSource}
            tabIndex={0}
            aria-label={copy.codeLabel}
            dangerouslySetInnerHTML={{ __html: dark ? selected.darkHtml : selected.lightHtml }}
          />
        </div>
      </div>
    </div>
  );
}
