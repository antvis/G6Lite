'use client';

import Image from 'next/image';
import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import exampleCrops from '@/data/example-crops.json';
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

type DetailTab = 'guide' | 'source' | 'data';
type PreviewStatus = 'loading' | 'ready' | 'error';

const DEFAULT_WORKSPACE_SPLIT = 54;
const MIN_PREVIEW_WIDTH = 360;
const MIN_CODE_WIDTH = 300;

type ExampleCrop = {
  width: number;
  height: number;
  left: number;
  top: number;
  cropWidth: number;
  cropHeight: number;
};

const exampleCropRecords = exampleCrops as Record<string, ExampleCrop>;
const WORKSPACE_RESIZER_WIDTH = 12;
const WORKSPACE_SPLIT_STORAGE_KEY = 'g6lite-example-workspace-split';
const DIRECTORY_OPEN_STORAGE_KEY = 'g6lite-example-directory-open';

function readOpenCategories(): string[] {
  try {
    const raw = window.sessionStorage.getItem(DIRECTORY_OPEN_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function storeOpenCategories(ids: readonly string[]) {
  try {
    window.sessionStorage.setItem(DIRECTORY_OPEN_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore private-mode storage failures and keep the in-memory list.
  }
}

function DirectoryThumb({ id, eager }: { id: string; eager: boolean }) {
  const crop = exampleCropRecords[id];
  if (!crop) return null;

  return (
    <span
      className="example-directory-thumb"
      style={{ '--crop-ratio': crop.cropWidth / crop.cropHeight } as CSSProperties}
    >
      <span className="example-directory-thumb-crop">
        <Image
          src={withBasePath(`/examples/${id}.png`)}
          alt=""
          width={crop.width}
          height={crop.height}
          loading={eager ? 'eager' : 'lazy'}
          unoptimized
          style={{
            width: `${(crop.width / crop.cropWidth) * 100}%`,
            height: `${(crop.height / crop.cropHeight) * 100}%`,
            left: `${(-crop.left / crop.cropWidth) * 100}%`,
            top: `${(-crop.top / crop.cropHeight) * 100}%`,
          }}
        />
      </span>
    </span>
  );
}

export function ExampleDetail({ id, locale }: { id: string; locale: Locale }) {
  const example = getSiteExample(id);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewPanelRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLElement>(null);
  const activeHandleRef = useRef<SiteExampleHandle | null>(null);
  const resizeFrameRef = useRef<number | null>(null);
  const splitRatioRef = useRef(DEFAULT_WORKSPACE_SPLIT);
  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState<PreviewStatus>('loading');
  const [error, setError] = useState('');
  const [renderDuration, setRenderDuration] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('guide');
  const [sourceResult, setSourceResult] = useState({
    id: '',
    source: '',
    highlighted: '',
    error: '',
  });
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [wrapSource, setWrapSource] = useState(false);
  const [query, setQuery] = useState('');
  const directoryNavRef = useRef<HTMLElement>(null);
  const directorySyncingRef = useRef(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [splitRatio, setSplitRatio] = useState(DEFAULT_WORKSPACE_SPLIT);
  const [workspaceResizing, setWorkspaceResizing] = useState(false);

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

    activeHandleRef.current = null;
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
        activeHandleRef.current = nextHandle;
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
      if (activeHandleRef.current === handle) activeHandleRef.current = null;
      handle?.destroy();
      container.replaceChildren();
    };
  }, [example, revision]);

  useLayoutEffect(() => {
    const nav = directoryNavRef.current;
    if (!nav || !example) return;

    const searching = query.trim().length > 0;
    const openIds = new Set(searching ? [] : readOpenCategories());
    if (!searching) openIds.add(example.category);

    directorySyncingRef.current = true;
    for (const details of nav.querySelectorAll<HTMLDetailsElement>('details')) {
      const categoryId = details.dataset.exampleCategory;
      if (!categoryId) continue;
      const nextOpen = searching || openIds.has(categoryId);
      if (details.open !== nextOpen) details.open = nextOpen;
    }
    directorySyncingRef.current = false;
    if (!searching) storeOpenCategories([...openIds]);
    nav.dataset.directoryReady = '';

    const onToggle = (event: Event) => {
      if (directorySyncingRef.current || searching) return;
      const target = event.target;
      if (!(target instanceof HTMLDetailsElement) || !nav.contains(target)) return;
      const ids = [...nav.querySelectorAll<HTMLDetailsElement>('details')]
        .filter((details) => details.open)
        .map((details) => details.dataset.exampleCategory)
        .filter((categoryId): categoryId is string => Boolean(categoryId));
      storeOpenCategories(ids);
    };
    nav.addEventListener('toggle', onToggle, true);
    return () => nav.removeEventListener('toggle', onToggle, true);
  }, [example, query]);

  useEffect(() => {
    if (!example) return;
    let cancelled = false;

    void Promise.all([
      fetch(withBasePath(`/example-sources/${example.id}.txt`)).then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      }),
      fetch(withBasePath(`/example-sources/${example.id}.highlighted.txt`))
        .then((response) => (response.ok ? response.text() : ''))
        .catch(() => ''),
    ])
      .then(([source, highlighted]) => {
        if (!cancelled) {
          setSourceResult({ id: example.id, source, highlighted, error: '' });
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setSourceResult({
            id: example.id,
            source: '',
            highlighted: '',
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

  useEffect(() => {
    const storedValue = window.localStorage.getItem(WORKSPACE_SPLIT_STORAGE_KEY);
    if (storedValue === null) return;

    const storedRatio = Number(storedValue);
    if (!Number.isFinite(storedRatio)) return;

    const nextRatio = Math.min(85, Math.max(20, storedRatio));
    const frame = requestAnimationFrame(() => {
      splitRatioRef.current = nextRatio;
      setSplitRatio(nextRatio);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(
    () => () => {
      document.body.classList.remove('example-workspace-resizing');
      if (resizeFrameRef.current !== null) cancelAnimationFrame(resizeFrameRef.current);
    },
    [],
  );

  const source = sourceResult.id === example?.id ? sourceResult.source : '';
  const highlightedSource = sourceResult.id === example?.id ? sourceResult.highlighted : '';
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
          guide: '说明',
          guideTitle: '示例说明',
          tryTitle: '如何体验',
          dataContext: '数据背景',
          capabilities: '关键能力',
          copy: '复制源码',
          copied: '已复制',
          wrap: '自动换行',
          unwrap: '取消换行',
          lines: '行',
          preview: '实时预览',
          fit: '适应画布',
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
          resizeWorkspace: '调整画布和源码宽度',
        }
      : {
          back: 'All examples',
          directory: 'Example directory',
          search: 'Search examples, capabilities, or APIs',
          source: 'Source',
          data: 'Data',
          guide: 'Guide',
          guideTitle: 'Example guide',
          tryTitle: 'How to try it',
          dataContext: 'Data context',
          capabilities: 'Key capabilities',
          copy: 'Copy source',
          copied: 'Copied',
          wrap: 'Wrap lines',
          unwrap: 'No wrap',
          lines: 'lines',
          preview: 'Live preview',
          fit: 'Fit view',
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
          resizeWorkspace: 'Resize preview and source panels',
        };

  async function copySource() {
    if (!source) return;
    await navigator.clipboard.writeText(source);
    setCopyState('copied');
    window.setTimeout(() => setCopyState('idle'), 1600);
  }

  async function fitPreview() {
    const handle = activeHandleRef.current;
    if (!handle) return;

    window.dispatchEvent(new Event('resize'));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await handle.fitView();
  }

  function scheduleWorkspaceResize() {
    if (resizeFrameRef.current !== null) cancelAnimationFrame(resizeFrameRef.current);
    resizeFrameRef.current = requestAnimationFrame(() => {
      resizeFrameRef.current = null;
      window.dispatchEvent(new Event('resize'));
    });
  }

  function getWorkspaceMeasurements() {
    const workspace = workspaceRef.current;
    if (!workspace) return null;

    const rect = workspace.getBoundingClientRect();
    const styles = window.getComputedStyle(workspace);
    const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(styles.paddingRight) || 0;
    const availableWidth = rect.width - paddingLeft - paddingRight - WORKSPACE_RESIZER_WIDTH;

    if (availableWidth <= MIN_PREVIEW_WIDTH + MIN_CODE_WIDTH) return null;
    return {
      availableWidth,
      contentLeft: rect.left + paddingLeft,
    };
  }

  function updateWorkspaceSplit(previewWidth: number, persist = false) {
    const measurements = getWorkspaceMeasurements();
    if (!measurements) return;

    const clampedWidth = Math.min(
      measurements.availableWidth - MIN_CODE_WIDTH,
      Math.max(MIN_PREVIEW_WIDTH, previewWidth),
    );
    const nextRatio = (clampedWidth / measurements.availableWidth) * 100;
    splitRatioRef.current = nextRatio;
    setSplitRatio(nextRatio);
    if (persist) {
      window.localStorage.setItem(WORKSPACE_SPLIT_STORAGE_KEY, nextRatio.toFixed(3));
    }
    scheduleWorkspaceResize();
  }

  function handleWorkspacePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setWorkspaceResizing(true);
    document.body.classList.add('example-workspace-resizing');

    const measurements = getWorkspaceMeasurements();
    if (measurements) updateWorkspaceSplit(event.clientX - measurements.contentLeft);
  }

  function handleWorkspacePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const measurements = getWorkspaceMeasurements();
    if (measurements) updateWorkspaceSplit(event.clientX - measurements.contentLeft);
  }

  function finishWorkspaceResize(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setWorkspaceResizing(false);
    document.body.classList.remove('example-workspace-resizing');
    window.localStorage.setItem(WORKSPACE_SPLIT_STORAGE_KEY, splitRatioRef.current.toFixed(3));
    scheduleWorkspaceResize();
  }

  function handleWorkspaceKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const measurements = getWorkspaceMeasurements();
    if (!measurements) return;

    event.preventDefault();
    const currentWidth = (splitRatioRef.current / 100) * measurements.availableWidth;
    updateWorkspaceSplit(currentWidth + (event.key === 'ArrowRight' ? 24 : -24), true);
  }

  const sourceLineCount = source ? source.replace(/\n$/, '').split('\n').length : 0;
  const workspaceStyle = {
    '--example-preview-fr': `${splitRatio}fr`,
    '--example-code-fr': `${100 - splitRatio}fr`,
  } as CSSProperties;

  return (
    <main className="example-detail-page not-prose">
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
            <noscript>
              <style>{'.example-directory nav { visibility: visible !important; }'}</style>
            </noscript>
            <nav aria-label={copy.directory} ref={directoryNavRef} suppressHydrationWarning>
              {siteExampleCategories.map((category) => {
                const entries = filteredExamples.filter((item) => item.category === category.id);
                if (entries.length === 0) return null;
                const searching = query.trim().length > 0;

                return (
                  <details
                    key={category.id}
                    data-example-category={category.id}
                    suppressHydrationWarning
                  >
                    <summary
                      onClick={(event) => {
                        if (searching) event.preventDefault();
                      }}
                    >
                      <span>{localizedText(category.title, locale)}</span>
                      <small>{entries.length}</small>
                    </summary>
                    <div>
                      {entries.map((item) => (
                        <a
                          aria-current={item.id === example.id ? 'page' : undefined}
                          href={withBasePath(localizedExamplePath(item.id, locale))}
                          key={item.id}
                        >
                          <DirectoryThumb
                            id={item.id}
                            eager={item.id === example.id}
                          />
                          <span>
                            <strong>{localizedText(item.title, locale)}</strong>
                            <small>{localizedText(item.group, locale)}</small>
                          </span>
                        </a>
                      ))}
                    </div>
                  </details>
                );
              })}
              <script
                dangerouslySetInnerHTML={{
                  __html: `(()=>{var nav=document.currentScript&&document.currentScript.parentElement;try{var key=${JSON.stringify(DIRECTORY_OPEN_STORAGE_KEY)};var parsed=JSON.parse(sessionStorage.getItem(key)||"[]");var ids=new Set(Array.isArray(parsed)?parsed.filter(function(item){return typeof item==="string";}):[]);ids.add(${JSON.stringify(example.category)});sessionStorage.setItem(key,JSON.stringify(Array.from(ids)));if(nav){nav.querySelectorAll("[data-example-category]").forEach(function(el){if(ids.has(el.getAttribute("data-example-category")))el.open=true;});}}catch(e){}if(nav)nav.setAttribute("data-directory-ready","");})();`,
                }}
              />
            </nav>
          </div>
        </div>
      </aside>

      <article className="example-detail-content">
        <header className="example-detail-header">
          <div className="example-detail-copy">
            <div className="example-detail-kicker">
              {localizedText(
                siteExampleCategories.find((category) => category.id === example.category)!.title,
                locale,
              )}
              <span>/</span>
              {localizedText(example.group, locale)}
            </div>
            <h1>{localizedText(example.title, locale)}</h1>
            <div className="example-detail-description">
              <p>{localizedText(example.description, locale)}</p>
              <div className="example-detail-tags">
                {example.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section
          className={`example-workspace${workspaceResizing ? ' is-resizing' : ''}`}
          ref={workspaceRef}
          style={workspaceStyle}
        >
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
                  disabled={status !== 'ready'}
                  onClick={() => void fitPreview()}
                  type="button"
                >
                  <span aria-hidden="true">◎</span>
                  {copy.fit}
                </button>
                <button
                  className="example-utility-button"
                  onClick={() => setRevision((value) => value + 1)}
                  type="button"
                >
                  <span aria-hidden="true">↻</span>
                  {status === 'error' ? copy.retry : copy.refresh}
                </button>
                <button
                  aria-pressed={previewExpanded}
                  className="example-utility-button"
                  onClick={() => setPreviewExpanded((value) => !value)}
                  type="button"
                >
                  <span aria-hidden="true">⛶</span>
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

          <div
            aria-label={copy.resizeWorkspace}
            aria-orientation="vertical"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={Math.round(splitRatio)}
            className="example-workspace-resizer"
            onDoubleClick={() => {
              splitRatioRef.current = DEFAULT_WORKSPACE_SPLIT;
              setSplitRatio(DEFAULT_WORKSPACE_SPLIT);
              window.localStorage.setItem(
                WORKSPACE_SPLIT_STORAGE_KEY,
                String(DEFAULT_WORKSPACE_SPLIT),
              );
              scheduleWorkspaceResize();
            }}
            onKeyDown={handleWorkspaceKeyDown}
            onPointerCancel={finishWorkspaceResize}
            onPointerDown={handleWorkspacePointerDown}
            onPointerMove={handleWorkspacePointerMove}
            onPointerUp={finishWorkspaceResize}
            role="separator"
            tabIndex={0}
          >
            <span aria-hidden="true" />
          </div>

          <div className="example-code-panel">
            <div className="example-panel-toolbar">
              <div className="example-code-toolbar-main">
                <div className="example-tabs" role="tablist">
                  <button
                    aria-selected={activeTab === 'guide'}
                    className={activeTab === 'guide' ? 'is-active' : undefined}
                    onClick={() => setActiveTab('guide')}
                    role="tab"
                    type="button"
                  >
                    {copy.guide}
                  </button>
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
              </div>
              {activeTab === 'source' ? (
                <div className="example-code-actions">
                  <button
                    aria-pressed={wrapSource}
                    className="example-utility-button"
                    onClick={() => setWrapSource((value) => !value)}
                    type="button"
                  >
                    <span aria-hidden="true">↩</span>
                    {wrapSource ? copy.unwrap : copy.wrap}
                  </button>
                  <button className="example-utility-button" onClick={copySource} type="button">
                    <span aria-hidden="true">⧉</span>
                    {copyState === 'copied' ? copy.copied : copy.copy}
                  </button>
                </div>
              ) : null}
            </div>
            <div className="example-code-content">
              {activeTab === 'guide' ? (
                <article className="example-guide-panel">
                  <header>
                    <span>{localizedText(example.group, locale)}</span>
                    <h2>{copy.guideTitle}</h2>
                    <p>{localizedText(example.description, locale)}</p>
                  </header>
                  <section>
                    <h3>{copy.tryTitle}</h3>
                    <p>{localizedText(example.interaction, locale)}</p>
                  </section>
                  <section>
                    <h3>{copy.dataContext}</h3>
                    <p>{localizedText(example.dataDescription, locale)}</p>
                  </section>
                  <section>
                    <h3>{copy.capabilities}</h3>
                    <div className="example-guide-tags">
                      {example.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </section>
                </article>
              ) : activeTab === 'source' ? (
                source ? (
                  highlightedSource ? (
                    <div
                      className={`example-highlighted-code shiki-host${wrapSource ? ' is-wrapped' : ''}`}
                      dangerouslySetInnerHTML={{ __html: highlightedSource }}
                      tabIndex={0}
                    />
                  ) : (
                    <pre className={wrapSource ? 'is-wrapped' : undefined} tabIndex={0}>
                      <code>{source}</code>
                    </pre>
                  )
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
            {activeTab === 'guide' ? null : (
              <footer className="example-code-footer">
                {activeTab === 'source' ? (
                  <>
                    <span>
                      TypeScript · ESM{sourceLineCount ? ` · ${sourceLineCount} ${copy.lines}` : ''}
                    </span>
                    <span>{example.file}</span>
                  </>
                ) : (
                  <>
                    <span>JSON</span>
                    <span>{copy.dataTitle}</span>
                  </>
                )}
              </footer>
            )}
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
