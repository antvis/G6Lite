'use client';

import { useTheme } from 'fumadocs-ui/provider/base';
import { ArrowUpRight, LoaderCircle, Minus, Plus, RotateCcw, Scan } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import type { Graph } from '../../../../src/index.ts';
import { CopyPrompt } from '@/components/ai-skill/copy-prompt';
import { localizedPath, type Locale } from '@/lib/i18n';
import type { HomepageShowcaseCopy } from './content';
import styles from './homepage.module.css';
import { showcaseIds, type ShowcaseCode, type ShowcaseId } from './showcase-catalog';
import { loadShowcaseCode } from './showcase-code-loader';

const subscribeNoop = () => () => {};

export function ExampleShowcase({
  locale,
  copy,
  initialCode,
}: {
  locale: Locale;
  copy: HomepageShowcaseCopy;
  initialCode: ShowcaseCode;
}) {
  const { resolvedTheme } = useTheme();
  // Static HTML contains the default light example. Match it during hydration
  // even when a saved dark theme is already available in the browser.
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const dark = hydrated && resolvedTheme === 'dark';
  const mountRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [active, setActive] = useState<ShowcaseId>('relationship');
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'waiting' | 'loading' | 'ready' | 'error'>('waiting');
  const [visible, setVisible] = useState(false);
  const [codes, setCodes] = useState<Record<string, ShowcaseCode>>({});
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeAttempt, setCodeAttempt] = useState(0);
  const codeKey = `${locale}:${active}:${dark ? 'dark' : 'light'}`;
  const selected = codeKey === `${locale}:relationship:light` ? initialCode : codes[codeKey];
  const index = showcaseIds.indexOf(active);

  useEffect(() => {
    if (selected || !visible) return;
    let disposed = false;
    void loadShowcaseCode(locale, active, dark ? 'dark' : 'light')
      .then((code) => {
        if (!disposed) setCodes((current) => ({ ...current, [codeKey]: code }));
      })
      .catch(() => {
        if (!disposed) setCodeError(codeKey);
      });
    return () => {
      disposed = true;
    };
  }, [active, locale, dark, codeKey, selected, visible, codeAttempt]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let graph: Graph | undefined;
    let clearHighlight: (() => void) | undefined;
    const start = async () => {
      setStatus('loading');
      try {
        const [{ Graph }, runtime] = await Promise.all([
          import('../../../../src/index.ts'),
          import('./showcase-examples'),
        ]);
        if (disposed) return;
        graph = new Graph({ container: mount, ...runtime.showcaseOptions(active, locale, dark) });
        graphRef.current = graph;
        await graph.render();
        if (disposed) return;
        if (active === 'relationship') clearHighlight = runtime.bindHomepageHighlight(graph);
        setStatus('ready');
      } catch {
        if (disposed) return;
        clearHighlight?.();
        graph?.destroy();
        graphRef.current = null;
        setStatus('error');
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setVisible(true);
        void start();
      },
      { rootMargin: '160px' },
    );
    observer.observe(mount);
    return () => {
      disposed = true;
      observer.disconnect();
      clearHighlight?.();
      graph?.destroy();
      if (graphRef.current === graph) graphRef.current = null;
    };
  }, [active, locale, dark, attempt]);

  function select(id: ShowcaseId) {
    if (id === active) return;
    setStatus('loading');
    setCodeError(null);
    setActive(id);
  }

  return (
    <div className={styles.showcase} id="developers">
      <div className={styles.showcaseHeader}>
        <div className={styles.showcaseTabs} role="tablist" aria-label={copy.tabs}>
          {showcaseIds.map((id, exampleIndex) => (
            <button
              type="button"
              role="tab"
              key={id}
              id={`showcase-tab-${id}`}
              aria-selected={active === id}
              aria-controls="showcase-panel"
              tabIndex={active === id ? 0 : -1}
              onClick={() => select(id)}
              onKeyDown={(event) => {
                const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
                if (!offset && event.key !== 'Home' && event.key !== 'End') return;
                event.preventDefault();
                const next =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? showcaseIds.length - 1
                      : (exampleIndex + offset + showcaseIds.length) % showcaseIds.length;
                select(showcaseIds[next]);
                document.getElementById(`showcase-tab-${showcaseIds[next]}`)?.focus();
              }}
            >
              {copy.items[exampleIndex].title}
            </button>
          ))}
        </div>
        <CopyPrompt
          key={`${active}-${dark}`}
          text={selected?.source ?? ''}
          disabled={!selected}
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
        <div
          className={styles.showcaseCode}
          data-showcase-code-status={
            selected ? 'ready' : codeError === codeKey ? 'error' : 'loading'
          }
          aria-busy={!selected && codeError !== codeKey}
        >
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
          {selected ? (
            <div
              key={`${active}-${dark}`}
              className={styles.showcaseSource}
              tabIndex={0}
              aria-label={copy.codeLabel}
              dangerouslySetInnerHTML={{ __html: selected.html }}
            />
          ) : (
            <div className={styles.showcaseCodeState} role="status">
              {codeError === codeKey ? (
                <>
                  <p>{locale === 'zh' ? '示例代码加载失败' : 'Unable to load example code'}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCodeError(null);
                      setCodeAttempt((value) => value + 1);
                    }}
                  >
                    {locale === 'zh' ? '重新加载代码' : 'Retry code'}
                  </button>
                </>
              ) : (
                <>
                  <LoaderCircle aria-hidden="true" />
                  {locale === 'zh' ? '正在加载代码' : 'Loading code'}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
