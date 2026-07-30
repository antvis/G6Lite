'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { runSiteExample, type SiteExampleHandle } from '@/lib/example-runtime';
import { localizedPath, type Locale } from '@/lib/i18n';
import {
  getSiteExample,
  localizedExamplePath,
  localizedText,
  siteExampleCategories,
  siteExamples,
} from '@/lib/site-examples';
import { withBasePath } from '@/lib/shared';

type DetailTab = 'source' | 'data';
type PreviewStatus = 'loading' | 'ready' | 'error';

export function ExampleDetail({ id, locale }: { id: string; locale: Locale }) {
  const example = getSiteExample(id);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewPanelRef = useRef<HTMLDivElement>(null);
  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState<PreviewStatus>('loading');
  const [error, setError] = useState('');
  const [renderDuration, setRenderDuration] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('source');
  const [sourceResult, setSourceResult] = useState({ id: '', source: '', error: '' });
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [query, setQuery] = useState('');
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const currentIndex = siteExamples.findIndex((item) => item.id === id);
  const previous = currentIndex > 0 ? siteExamples[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 ? siteExamples[currentIndex + 1] : undefined;

  const filteredExamples = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return siteExamples;

    return siteExamples.filter((item) => {
      const haystack = [
        localizedText(item.title, locale),
        localizedText(item.description, locale),
        localizedText(item.group, locale),
        ...item.tags,
      ]
        .join(' ')
        .toLocaleLowerCase();
      return haystack.includes(normalized);
    });
  }, [locale, query]);

  useEffect(() => {
    if (!example) return;

    let cancelled = false;
    let handle: SiteExampleHandle | undefined;
    const container = previewRef.current;
    if (!container) return;

    container.replaceChildren();
    setStatus('loading');
    setError('');
    setRenderDuration(null);
    const startedAt = performance.now();

    void runSiteExample(example.id, container)
      .then(async (nextHandle) => {
        handle = nextHandle;
        await nextHandle.ready;
        if (cancelled) {
          nextHandle.destroy();
          return;
        }
        setRenderDuration(performance.now() - startedAt);
        setStatus('ready');
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        container.replaceChildren();
        setError(reason instanceof Error ? reason.message : String(reason));
        setStatus('error');
      });

    return () => {
      cancelled = true;
      handle?.destroy();
      container.replaceChildren();
    };
  }, [example, revision]);

  useEffect(() => {
    if (!example) return;
    let cancelled = false;

    void fetch(withBasePath(`/example-sources/${example.id}.txt`))
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((value) => {
        if (!cancelled) setSourceResult({ id: example.id, source: value, error: '' });
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setSourceResult({
            id: example.id,
            source: '',
            error: reason instanceof Error ? reason.message : String(reason),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [example]);

  useEffect(() => {
    if (!previewExpanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewExpanded(false);
    };

    document.body.classList.add('example-preview-expanded');
    window.addEventListener('keydown', handleKeyDown);
    window.dispatchEvent(new Event('resize'));

    return () => {
      document.body.classList.remove('example-preview-expanded');
      window.removeEventListener('keydown', handleKeyDown);
      window.dispatchEvent(new Event('resize'));
    };
  }, [previewExpanded]);

  const source = sourceResult.id === example?.id ? sourceResult.source : '';
  const sourceError = sourceResult.id === example?.id ? sourceResult.error : '';

  if (!example) {
    return (
      <main className="example-detail-missing">
        <h1>{locale === 'zh' ? '未找到示例' : 'Example not found'}</h1>
        <a href={withBasePath(localizedPath('/docs/examples', locale))}>
          {locale === 'zh' ? '返回示例总览' : 'Back to examples'}
        </a>
      </main>
    );
  }

  const copy =
    locale === 'zh'
      ? {
          back: '示例总览',
          directory: '示例目录',
          search: '搜索示例、能力或 API',
          source: '源码',
          data: '数据',
          copy: '复制源码',
          copied: '已复制',
          preview: '实时预览',
          refresh: '刷新',
          fullscreen: '全屏',
          exitFullscreen: '退出全屏',
          loading: '正在加载示例',
          ready: '运行正常',
          retry: '重新运行',
          renderTime: '本次初始化',
          interaction: '如何体验',
          dataTitle: '数据说明',
          previous: '上一个示例',
          next: '下一个示例',
          sourceLoading: '正在读取源码…',
          sourceError: '源码读取失败',
          browseDirectory: '浏览示例目录',
          closeDirectory: '收起示例目录',
        }
      : {
          back: 'All examples',
          directory: 'Example directory',
          search: 'Search examples, capabilities, or APIs',
          source: 'Source',
          data: 'Data',
          copy: 'Copy source',
          copied: 'Copied',
          preview: 'Live preview',
          refresh: 'Refresh',
          fullscreen: 'Fullscreen',
          exitFullscreen: 'Exit fullscreen',
          loading: 'Loading example',
          ready: 'Running',
          retry: 'Run again',
          renderTime: 'Initialization',
          interaction: 'Try it',
          dataTitle: 'Data notes',
          previous: 'Previous example',
          next: 'Next example',
          sourceLoading: 'Loading source…',
          sourceError: 'Unable to load source',
          browseDirectory: 'Browse directory',
          closeDirectory: 'Close directory',
        };

  async function copySource() {
    if (!source) return;
    await navigator.clipboard.writeText(source);
    setCopyState('copied');
    window.setTimeout(() => setCopyState('idle'), 1600);
  }

  return (
    <main className="example-detail-page">
      <aside className="example-directory">
        <div className="example-directory-sticky">
          <div className="example-directory-header">
            <a
              className="example-directory-back"
              href={withBasePath(localizedPath('/docs/examples', locale))}
            >
              <span aria-hidden="true">←</span>
              {copy.back}
            </a>
            <button
              aria-expanded={directoryOpen}
              className="example-directory-toggle"
              onClick={() => setDirectoryOpen((value) => !value)}
              type="button"
            >
              {directoryOpen ? copy.closeDirectory : copy.browseDirectory}
            </button>
          </div>
          <div className={`example-directory-body${directoryOpen ? ' is-open' : ''}`}>
            <h2>{copy.directory}</h2>
            <label className="example-directory-search">
              <span aria-hidden="true">⌕</span>
              <input
                aria-label={copy.search}
                placeholder={copy.search}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <nav aria-label={copy.directory}>
              {siteExampleCategories.map((category) => {
                const entries = filteredExamples.filter((item) => item.category === category.id);
                if (entries.length === 0) return null;
                const containsCurrent = entries.some((item) => item.id === example.id);

                return (
                  <details key={category.id} open={containsCurrent || query.length > 0}>
                    <summary>{localizedText(category.title, locale)}</summary>
                    <div>
                      {entries.map((item) => (
                        <a
                          aria-current={item.id === example.id ? 'page' : undefined}
                          href={withBasePath(localizedExamplePath(item.id, locale))}
                          key={item.id}
                        >
                          <span>{localizedText(item.title, locale)}</span>
                          <small>{localizedText(item.group, locale)}</small>
                        </a>
                      ))}
                    </div>
                  </details>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      <article className="example-detail-content">
        <header className="example-detail-header">
          <div className="example-detail-kicker">
            {localizedText(
              siteExampleCategories.find((category) => category.id === example.category)!.title,
              locale,
            )}
            <span>/</span>
            {localizedText(example.group, locale)}
          </div>
          <h1>{localizedText(example.title, locale)}</h1>
          <p>{localizedText(example.description, locale)}</p>
          <div className="example-detail-tags">
            {example.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="example-detail-metrics">
            {example.metrics.map((metric) => (
              <div key={localizedText(metric.label, locale)}>
                <strong>{metric.value}</strong>
                <span>{localizedText(metric.label, locale)}</span>
              </div>
            ))}
          </div>
        </header>

        <section className="example-workspace">
          <div className="example-code-panel">
            <div className="example-panel-toolbar">
              <div className="example-tabs" role="tablist">
                <button
                  aria-selected={activeTab === 'source'}
                  className={activeTab === 'source' ? 'is-active' : undefined}
                  onClick={() => setActiveTab('source')}
                  role="tab"
                  type="button"
                >
                  {copy.source}
                </button>
                <button
                  aria-selected={activeTab === 'data'}
                  className={activeTab === 'data' ? 'is-active' : undefined}
                  onClick={() => setActiveTab('data')}
                  role="tab"
                  type="button"
                >
                  {copy.data}
                </button>
              </div>
              {activeTab === 'source' ? (
                <button className="example-utility-button" onClick={copySource} type="button">
                  {copyState === 'copied' ? copy.copied : copy.copy}
                </button>
              ) : null}
            </div>
            <div className="example-code-content">
              {activeTab === 'source' ? (
                source ? (
                  <pre tabIndex={0}>
                    <code>{source}</code>
                  </pre>
                ) : (
                  <div className="example-panel-message">
                    {sourceError ? `${copy.sourceError}: ${sourceError}` : copy.sourceLoading}
                  </div>
                )
              ) : (
                <div className="example-data-panel">
                  <div>
                    <h2>{copy.dataTitle}</h2>
                    <p>{localizedText(example.dataDescription, locale)}</p>
                  </div>
                  <pre>
                    <code>{example.dataPreview}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div
            className={`example-preview-panel${previewExpanded ? ' is-fullscreen' : ''}`}
            ref={previewPanelRef}
          >
            <div className="example-panel-toolbar">
              <div className="example-preview-title">
                <span>{copy.preview}</span>
                <small className={`is-${status}`}>
                  {status === 'loading' ? copy.loading : status === 'ready' ? copy.ready : error}
                </small>
              </div>
              <div className="example-preview-actions">
                <button
                  className="example-utility-button"
                  onClick={() => setRevision((value) => value + 1)}
                  type="button"
                >
                  {status === 'error' ? copy.retry : copy.refresh}
                </button>
                <button
                  aria-pressed={previewExpanded}
                  className="example-utility-button"
                  onClick={() => setPreviewExpanded((value) => !value)}
                  type="button"
                >
                  {previewExpanded ? copy.exitFullscreen : copy.fullscreen}
                </button>
              </div>
            </div>
            <div className="example-preview-stage">
              <div className="example-preview-canvas" ref={previewRef} />
              {status === 'loading' ? (
                <div className="example-preview-overlay">
                  <span />
                  {copy.loading}
                </div>
              ) : null}
              {status === 'error' ? (
                <div className="example-preview-overlay is-error">
                  <strong>{copy.sourceError}</strong>
                  <span>{error}</span>
                </div>
              ) : null}
            </div>
            <footer className="example-preview-footer">
              <span>
                <strong>{copy.interaction}</strong>
                {localizedText(example.interaction, locale)}
              </span>
              {renderDuration !== null ? (
                <span>
                  {copy.renderTime} {Math.round(renderDuration)}ms
                </span>
              ) : null}
            </footer>
          </div>
        </section>

        <nav className="example-detail-pagination" aria-label={copy.directory}>
          {previous ? (
            <a href={withBasePath(localizedExamplePath(previous.id, locale))}>
              <small>{copy.previous}</small>
              <strong>{localizedText(previous.title, locale)}</strong>
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a href={withBasePath(localizedExamplePath(next.id, locale))}>
              <small>{copy.next}</small>
              <strong>{localizedText(next.title, locale)}</strong>
            </a>
          ) : null}
        </nav>
      </article>
    </main>
  );
}
