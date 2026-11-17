'use client';

import Link from 'next/link';
import { Maximize2, Minimize2, RotateCcw, Scan } from 'lucide-react';
import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import dynamic from 'next/dynamic';

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
import { ExampleStackBlitz } from './example-stackblitz';
import canvasStyles from './quick-start-example.module.css';

type DetailTab = 'source' | 'data' | 'guide';
type PreviewStatus = 'loading' | 'ready' | 'error';

const CodeEditor = dynamic(
  () => import('@/components/example-code-editor').then((mod) => mod.ExampleCodeEditor),
  { ssr: false },
);

const DEFAULT_WORKSPACE_SPLIT = 50;
const MIN_PREVIEW_WIDTH = 360;
const MIN_CODE_WIDTH = 300;
const MAX_DATA_PREVIEW_LENGTH = 100_000;

const WORKSPACE_RESIZER_WIDTH = 12;
// Start with equal panes instead of restoring ratios saved for the previous layout.
const WORKSPACE_SPLIT_STORAGE_KEY = 'g6lite-example-workspace-split-v2';

export function ExampleDetailClient({
  id,
  locale,
  initialSource,
  helperFile,
}: {
  id: string;
  locale: Locale;
  initialSource: string;
  helperFile?: { name: string; source: string };
}) {
  const example = getSiteExample(id);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewToolbarRef = useRef<HTMLDivElement>(null);
  const previewPanelRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLElement>(null);
  const activeHandleRef = useRef<SiteExampleHandle | null>(null);
  // Bumped whenever the built-in example restarts; a playground run started
  // earlier must not claim the preview afterwards.
  const playgroundTokenRef = useRef(0);
  const resizeFrameRef = useRef<number | null>(null);
  const splitRatioRef = useRef(DEFAULT_WORKSPACE_SPLIT);
  const [revision, setRevision] = useState(0);
  // Snapshot effects follow the installed handle, not the restart request.
  const [handleRevision, setHandleRevision] = useState(0);
  const [status, setStatus] = useState<PreviewStatus>('loading');
  const [error, setError] = useState('');
  const [renderDuration, setRenderDuration] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('source');
  // Each example starts with its own build-time source.
  const [draft, setDraft] = useState(initialSource);
  const [showHelper, setShowHelper] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [liveData, setLiveData] = useState({ display: '', full: '', unavailable: false });
  const [highlightedData, setHighlightedData] = useState({ source: '', html: '' });
  const [wrapSource, setWrapSource] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [splitRatio, setSplitRatio] = useState(DEFAULT_WORKSPACE_SPLIT);
  const [workspaceResizing, setWorkspaceResizing] = useState(false);

  const currentIndex = siteExamples.findIndex((item) => item.id === id);
  const previous = currentIndex > 0 ? siteExamples[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 ? siteExamples[currentIndex + 1] : undefined;

  useEffect(() => {
    if (!example) return;
    document.title = `${localizedText(example.title, locale)} | G6Lite`;
  }, [example, locale]);

  useEffect(() => {
    if (!example) return;

    let cancelled = false;
    let pendingHandle: SiteExampleHandle | undefined;
    const container = previewRef.current;
    if (!container) return;

    activeHandleRef.current = null;
    container.replaceChildren();
    const token = ++playgroundTokenRef.current;
    setStatus('loading');
    setError('');
    setRenderDuration(null);
    const startedAt = performance.now();

    void runSiteExample(example.id, container, previewToolbarRef.current)
      .then(async (nextHandle) => {
        if (cancelled || token !== playgroundTokenRef.current) {
          nextHandle.destroy();
          return;
        }
        pendingHandle = nextHandle;
        await nextHandle.ready;
        if (cancelled) return;
        pendingHandle = undefined;
        if (token !== playgroundTokenRef.current) {
          nextHandle.destroy();
          return;
        }
        activeHandleRef.current = nextHandle;
        setHandleRevision((value) => value + 1);
        setRenderDuration(performance.now() - startedAt);
        setStatus('ready');
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        pendingHandle?.destroy();
        pendingHandle = undefined;
        if (token !== playgroundTokenRef.current) return;
        container.replaceChildren();
        setError(reason instanceof Error ? reason.message : String(reason));
        setStatus('error');
      });

    return () => {
      cancelled = true;
      playgroundTokenRef.current += 1;
      pendingHandle?.destroy();
      activeHandleRef.current?.destroy();
      activeHandleRef.current = null;
      container.replaceChildren();
    };
  }, [example, revision]);


  // Serializes the live graph data from the running example whenever the data
  // tab is opened, so the panel always shows the real dataset in the preview.
  useEffect(() => {
    if (activeTab !== 'data' || status !== 'ready') return;

    // Examples returning a custom handle have no data to export; show that
    // explicitly instead of an endless "loading" placeholder.
    const data = activeHandleRef.current?.getData?.();
    if (!data || typeof data !== 'object') {
      setLiveData({ display: '', full: '', unavailable: true });
      return;
    }

    const json = JSON.stringify(data, null, 2);
    if (json.length <= MAX_DATA_PREVIEW_LENGTH) {
      setLiveData({ display: json, full: json, unavailable: false });
      return;
    }

    const { nodes, edges } = data as { nodes?: unknown[]; edges?: unknown[] };
    const nodeCount = Array.isArray(nodes) ? nodes.length : 0;
    const edgeCount = Array.isArray(edges) ? edges.length : 0;
    const note =
      locale === 'zh'
        ? `… 数据过大已截断，完整数据共 ${nodeCount} 个节点、${edgeCount} 条边`
        : `… truncated; the full dataset has ${nodeCount} nodes and ${edgeCount} edges`;
    setLiveData({
      display: `${json.slice(0, MAX_DATA_PREVIEW_LENGTH)}\n${note}`,
      full: json,
      unavailable: false,
    });
  }, [activeTab, status, handleRevision, locale]);

  // Highlights the live JSON on demand with shiki; the source tab renders
  // through the editor instead, so this only serves the data tab.
  // The result is tagged with its input so stale markup never renders.
  useEffect(() => {
    const json = liveData.display;
    if (!json) return;

    let cancelled = false;
    void import('shiki')
      .then(({ codeToHtml }) =>
        codeToHtml(json, {
          lang: 'json',
          themes: { light: 'github-light', dark: 'github-dark' },
          defaultColor: false,
        }),
      )
      .then((html) => {
        if (!cancelled) setHighlightedData({ source: json, html });
      })
      .catch(() => {
        // The plain <pre> fallback renders while highlighting is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [liveData.display]);

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

  // The server component inlines this source at build time.
  const source = initialSource;
  const displayedHelper = showHelper ? helperFile : undefined;
  const displayedSource = displayedHelper?.source ?? draft;
  const dirty = source.length > 0 && draft !== source;
  const highlightedJson =
    highlightedData.source === liveData.display ? highlightedData.html : '';

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
          directory: '示例目录',
          source: '源码',
          data: '数据',
          guide: '说明',
          guideTitle: '示例说明',
          tryTitle: '如何体验',
          dataContext: '数据背景',
          capabilities: '关键能力',
          copy: '复制源码',
          copyFile: '复制当前文件',
          sourceFiles: '源码文件',
          readOnly: '只读',
          stackBlitz: '在 StackBlitz 中打开',
          copyData: '复制数据',
          copied: '已复制',
          run: '运行',
          reset: '重置',
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
          noData: '该示例未提供数据导出',
          previous: '上一个示例',
          next: '下一个示例',
          sourceError: '示例运行出错',
          resizeWorkspace: '调整画布和源码宽度',
        }
      : {
          directory: 'Example directory',
          source: 'Source',
          data: 'Data',
          guide: 'Guide',
          guideTitle: 'Example guide',
          tryTitle: 'How to try it',
          dataContext: 'Data context',
          capabilities: 'Key capabilities',
          copy: 'Copy source',
          copyFile: 'Copy file',
          sourceFiles: 'Source files',
          readOnly: 'Read only',
          stackBlitz: 'Open in StackBlitz',
          copyData: 'Copy data',
          copied: 'Copied',
          run: 'Run',
          reset: 'Reset',
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
          noData: 'This example does not export data',
          previous: 'Previous example',
          next: 'Next example',
          sourceError: 'Example failed to run',
          resizeWorkspace: 'Resize preview and source panels',
        };

  async function copySource() {
    if (!displayedSource) return;
    await navigator.clipboard.writeText(displayedSource);
    setCopyState('copied');
    window.setTimeout(() => setCopyState('idle'), 1600);
  }

  // Compiles the edited source in the browser and swaps it into the preview.
  // A token guards against the run claiming the preview after the built-in
  // example has been restarted mid-compile.
  async function runEditedSource() {
    const container = previewRef.current;
    if (!container || !example || !draft) return;

    const token = ++playgroundTokenRef.current;
    activeHandleRef.current?.destroy();
    activeHandleRef.current = null;
    container.replaceChildren();
    setStatus('loading');
    setError('');
    setRenderDuration(null);

    try {
      const { runPlaygroundExample } = await import('@/lib/playground-runtime');
      const startedAt = performance.now();
      const handle = await runPlaygroundExample(draft, container);
      if (token !== playgroundTokenRef.current) {
        handle.destroy();
        return;
      }
      activeHandleRef.current = handle;
      setHandleRevision((value) => value + 1);
      setRenderDuration(performance.now() - startedAt);
      setStatus('ready');
    } catch (reason: unknown) {
      if (token !== playgroundTokenRef.current) return;
      container.replaceChildren();
      setError(reason instanceof Error ? reason.message : String(reason));
      setStatus('error');
    }
  }

  function resetEditedSource() {
    playgroundTokenRef.current += 1;
    setDraft(source);
    setRevision((value) => value + 1);
  }

  // Copies the complete dataset, even when the panel shows a truncated preview.
  async function copyData() {
    if (!liveData.full) return;
    await navigator.clipboard.writeText(liveData.full);
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

  const sourceLineCount = displayedSource ? displayedSource.replace(/\n$/, '').split('\n').length : 0;
  const workspaceStyle = {
    '--example-preview-fr': `${splitRatio}fr`,
    '--example-code-fr': `${100 - splitRatio}fr`,
  } as CSSProperties;

  return (

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
            </div>
            <div className={`example-preview-stage ${canvasStyles.viewport}`}>
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
              <div ref={previewToolbarRef} className={canvasStyles.tools} role="toolbar" aria-label={copy.preview}>
                <button
                  aria-label={copy.fit}
                  disabled={status !== 'ready'}
                  onClick={() => void fitPreview()}
                  title={copy.fit}
                  type="button"
                >
                  <Scan aria-hidden="true" />
                </button>
                <button
                  aria-label={status === 'error' ? copy.retry : copy.refresh}
                  onClick={() => setRevision((value) => value + 1)}
                  title={status === 'error' ? copy.retry : copy.refresh}
                  type="button"
                >
                  <RotateCcw aria-hidden="true" />
                </button>
                <button
                  aria-label={previewExpanded ? copy.exitFullscreen : copy.fullscreen}
                  aria-pressed={previewExpanded}
                  onClick={() => setPreviewExpanded((value) => !value)}
                  title={previewExpanded ? copy.exitFullscreen : copy.fullscreen}
                  type="button"
                >
                  {previewExpanded ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
                </button>
              </div>
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
                  <button
                    aria-selected={activeTab === 'guide'}
                    className={activeTab === 'guide' ? 'is-active' : undefined}
                    onClick={() => setActiveTab('guide')}
                    role="tab"
                    type="button"
                  >
                    {copy.guide}
                  </button>
                </div>
              </div>
              {activeTab === 'source' ? (
                <div className="example-code-actions">
                  <button
                    className={`example-utility-button${dirty ? ' is-dirty' : ''}`}
                    disabled={!source || !!displayedHelper}
                    onClick={() => void runEditedSource()}
                    type="button"
                  >
                    <span aria-hidden="true">▶</span>
                    {copy.run}
                  </button>
                  <button
                    className="example-utility-button"
                    disabled={!dirty || !!displayedHelper}
                    onClick={resetEditedSource}
                    type="button"
                  >
                    <span aria-hidden="true">⟲</span>
                    {copy.reset}
                  </button>
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
                    {copyState === 'copied' ? copy.copied : helperFile ? copy.copyFile : copy.copy}
                  </button>
                </div>
              ) : activeTab === 'data' ? (
                <div className="example-code-actions">
                  <button
                    className="example-utility-button"
                    disabled={!liveData.full}
                    onClick={copyData}
                    type="button"
                  >
                    <span aria-hidden="true">⧉</span>
                    {copyState === 'copied' ? copy.copied : copy.copyData}
                  </button>
                </div>
              ) : null}
            </div>
            {activeTab === 'source' && helperFile ? (
              <div className="example-source-files">
                <div className="example-source-file-switch" role="group" aria-label={copy.sourceFiles}>
                  {[example.file, helperFile.name].map((name) => (
                    <button
                      aria-pressed={name === (displayedHelper?.name ?? example.file)}
                      className="example-utility-button"
                      key={name}
                      onClick={() => {
                        setShowHelper(name === helperFile.name);
                        setCopyState('idle');
                      }}
                      type="button"
                    >
                      {name}
                      {name === helperFile.name && <span className="example-source-file-note">{copy.readOnly}</span>}
                    </button>
                  ))}
                </div>
                <ExampleStackBlitz
                  entry={{ name: example.file, source: draft }}
                  helper={helperFile}
                  label={copy.stackBlitz}
                  title={localizedText(example.title, locale)}
                />
              </div>
            ) : null}
            <div className="example-code-content">
              <div hidden={activeTab !== 'guide'}>
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
                  {example.documentation?.length ? (
                    <section>
                      <h3>{locale === 'zh' ? '继续阅读' : 'Related documentation'}</h3>
                      <ul>
                        {example.documentation.map((link) => (
                          <li key={link.href}>
                            <a href={withBasePath(localizedPath(link.href, locale))}>
                              {localizedText(link.title, locale)}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </article>
              </div>
              {activeTab === 'source' ? (
                source ? (
                  <CodeEditor
                    key={displayedHelper?.name ?? example.file}
                    onChange={displayedHelper ? undefined : setDraft}
                    readOnly={!!displayedHelper}
                    value={displayedSource}
                    wrap={wrapSource}
                  />
                ) : (
                  <div className="example-panel-message">{copy.sourceError}</div>
                )
              ) : activeTab === 'data' ? (
                <div className="example-data-panel">
                  <div>
                    <h2>{copy.dataTitle}</h2>
                    <p>{localizedText(example.dataDescription, locale)}</p>
                  </div>
                  {highlightedJson ? (
                    <div
                      className="example-highlighted-code shiki-host"
                      dangerouslySetInnerHTML={{ __html: highlightedJson }}
                      tabIndex={0}
                    />
                  ) : (
                    <pre>
                      <code>
                        {liveData.display || (liveData.unavailable ? copy.noData : copy.loading)}
                      </code>
                    </pre>
                  )}
                </div>
              ) : null}
            </div>
            {activeTab === 'guide' ? null : (
              <footer className="example-code-footer">
                {activeTab === 'source' ? (
                  <>
                    <span>
                      TypeScript · ESM{sourceLineCount ? ` · ${sourceLineCount} ${copy.lines}` : ''}
                    </span>
                    <span>{displayedHelper?.name ?? example.file}</span>
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
            <Link href={localizedExamplePath(previous.id, locale)} prefetch={false}>
              <small>{copy.previous}</small>
              <strong>{localizedText(previous.title, locale)}</strong>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={localizedExamplePath(next.id, locale)} prefetch={false}>
              <small>{copy.next}</small>
              <strong>{localizedText(next.title, locale)}</strong>
            </Link>
          ) : null}
        </nav>
      </article>
  );
}
