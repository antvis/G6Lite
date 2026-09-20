'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';

import {
  adjustMockGraph,
  buildMockCode,
  createMockGraphFromTemplate,
  generateMockResult,
  getMockCases,
  needsMockPromptClarification,
  serializeMockGraph,
  type AiWorkspaceMode,
  type MockGenerationResult,
  type MockGraphLayout,
} from '@/lib/ai-workspace-mock';
import { localizedPath, type Locale } from '@/lib/i18n';

import {
  AiNativeGraph,
  type AiNativeGraphHandle,
  type AiNativeGraphStatus,
} from './ai-native-graph';
import styles from './ai-workspace.module.css';

type WorkspaceStage = 'generating' | 'landing' | 'workspace';
type InspectorTab = 'code' | 'conversation' | 'data';
type ChatMessage = { id: string; role: 'assistant' | 'user'; text: string };

const content = {
  zh: {
    mock: '站内原型 · Mock',
    eyebrow: 'G6Lite 原生 AI 画布',
    titleLead: '描述关系，',
    titleAccent: '立即生成可交互图',
    description:
      '用自然语言描述实体与关系，在站内通过 G6Lite WebGL 画布查看布局、交互、图数据和可运行代码。',
    modes: {
      create: { label: '关系图生成', short: '生成' },
      qa: { label: 'G6Lite 答疑', short: '答疑' },
    },
    placeholders: {
      create: '例如：用户创建订单，订单包含商品，并使用从左到右的布局…',
      qa: '例如：G6Lite 的数据、布局、渲染和交互之间是什么关系？',
    },
    inputLabel: '描述你的关系图需求',
    send: '生成关系图',
    inputHint: 'Enter 发送 · Shift + Enter 换行',
    privacy: '纯前端 Mock，不上传、记录或发送你的输入。',
    emptyError: '先描述一下想生成的关系图。',
    clarificationTitle: '还需要一点关系信息',
    clarificationDescription: '请至少告诉我两个实体，以及它们之间的动作或关系。',
    clarificationExample: '用户创建订单，订单包含商品',
    useClarificationExample: '使用这个示例',
    casesTitle: '从一个具体场景开始',
    casesDescription: '案例只提供结构化提示，真正的关系图由 G6Lite 在生成后运行。',
    useCase: '填入这个场景',
    nodes: (count: number) => `${count} 个实体`,
    relations: (count: number) => `${count} 条关系`,
    layouts: { horizontal: '从左到右', vertical: '从上到下', radial: '环形网络' },
    learnTitle: '继续了解 G6Lite',
    learnLinks: [
      ['AI 使用指南', '/docs/ai'],
      ['关系图示例', '/docs/examples'],
      ['技术架构', '/docs/concepts/architecture'],
    ],
    generationTitle: '正在构建原生 G6Lite 画布',
    generationDescription: '先模拟解析实体和关系，再交给 G6Lite 执行布局与 WebGL 渲染。',
    generationSteps: ['解析实体与意图', '生成结构化图数据', '启动 G6Lite 布局与渲染'],
    cancel: '返回修改',
    workspaceEyebrow: 'G6Lite · WebGL',
    restart: '重新描述',
    inspect: '检查结果',
    fitView: '适应画布',
    graphStats: (nodes: number, edges: number) => `${nodes} 个节点 · ${edges} 条关系`,
    rendering: '正在启动 G6Lite WebGL…',
    renderError: '原生画布渲染失败',
    retry: '重新渲染',
    inspectorTitle: '结果检查',
    closeInspector: '关闭检查面板',
    conversation: '对话',
    data: '图数据',
    code: 'G6Lite 代码',
    assistant: 'G6Lite AI',
    you: '你',
    prototypeReply: 'Mock 回复',
    refining: '正在更新原生画布…',
    followUpLabel: '继续调整关系图',
    followUpPlaceholder: '继续描述，例如：改成从上到下，并换成绿色…',
    followUpSend: '应用调整',
    quickAdjustments: ['从上到下并换成绿色', '隐藏标签', '增加一个节点'],
    copy: '复制',
    copied: '已复制',
    copyFailed: '复制失败，请手动选择内容。',
    prototypeNotice: '关系图由 G6Lite 原生运行；关系内容仍由本地 Mock 规则生成。',
  },
  en: {
    mock: 'In-site prototype · Mock',
    eyebrow: 'Native G6Lite AI canvas',
    titleLead: 'Describe relationships.',
    titleAccent: 'Get an interactive graph.',
    description:
      'Describe entities and relationships naturally, then inspect layouts, interactions, graph data, and runnable code on a native G6Lite WebGL canvas.',
    modes: {
      create: { label: 'Graph creation', short: 'Create' },
      qa: { label: 'G6Lite Q&A', short: 'Q&A' },
    },
    placeholders: {
      create:
        'For example: users create orders, orders contain products, in a left-to-right layout…',
      qa: 'For example: how do data, layouts, rendering, and interactions work together?',
    },
    inputLabel: 'Describe your relationship graph',
    send: 'Generate graph',
    inputHint: 'Enter to send · Shift + Enter for a new line',
    privacy: 'Client-side Mock only. Your input is not uploaded, stored, or transmitted.',
    emptyError: 'Describe the relationship graph you want to generate first.',
    clarificationTitle: 'Add a little relationship detail',
    clarificationDescription:
      'Name at least two entities and the action or relationship between them.',
    clarificationExample: 'Users create orders, and orders contain products',
    useClarificationExample: 'Use this example',
    casesTitle: 'Start with a concrete scenario',
    casesDescription:
      'Prompts provide structure; G6Lite runs the actual relationship graph after generation.',
    useCase: 'Use this scenario',
    nodes: (count: number) => `${count} entities`,
    relations: (count: number) => `${count} relationships`,
    layouts: { horizontal: 'Left to right', vertical: 'Top to bottom', radial: 'Radial network' },
    learnTitle: 'Continue with G6Lite',
    learnLinks: [
      ['AI guide', '/docs/ai'],
      ['Graph examples', '/docs/examples'],
      ['Architecture', '/docs/concepts/architecture'],
    ],
    generationTitle: 'Building a native G6Lite canvas',
    generationDescription:
      'The prototype structures entities and relationships before G6Lite runs layout and WebGL rendering.',
    generationSteps: [
      'Parse entities and intent',
      'Generate structured graph data',
      'Run G6Lite layout and rendering',
    ],
    cancel: 'Back to prompt',
    workspaceEyebrow: 'G6Lite · WebGL',
    restart: 'New prompt',
    inspect: 'Inspect result',
    fitView: 'Fit view',
    graphStats: (nodes: number, edges: number) => `${nodes} nodes · ${edges} relationships`,
    rendering: 'Starting G6Lite WebGL…',
    renderError: 'Native canvas rendering failed',
    retry: 'Render again',
    inspectorTitle: 'Inspect result',
    closeInspector: 'Close inspector',
    conversation: 'Conversation',
    data: 'Graph data',
    code: 'G6Lite code',
    assistant: 'G6Lite AI',
    you: 'You',
    prototypeReply: 'Mock response',
    refining: 'Updating the native canvas…',
    followUpLabel: 'Refine the relationship graph',
    followUpPlaceholder: 'Continue, for example: make it top-to-bottom and green…',
    followUpSend: 'Apply change',
    quickAdjustments: ['Top-to-bottom and green', 'Hide labels', 'Add one node'],
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed. Select the content manually.',
    prototypeNotice:
      'The graph runs natively in G6Lite; relationship content still comes from local Mock rules.',
  },
} as const;

function SparkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 2.8c.45 3.65 2.42 5.62 6.08 6.08-3.66.46-5.63 2.43-6.08 6.08-.46-3.65-2.43-5.62-6.08-6.08C9.57 8.42 11.54 6.45 12 2.8Z" />
      <path d="M18.5 14.2c.24 1.92 1.28 2.96 3.2 3.2-1.92.24-2.96 1.28-3.2 3.2-.24-1.92-1.28-2.96-3.2-3.2 1.92-.24 2.96-1.28 3.2-3.2Z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m4 4 17 8-17 8 3.5-8L4 4Z" />
      <path d="M7.5 12H21" />
    </svg>
  );
}

function PanelIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect height="16" rx="2" width="18" x="3" y="4" />
      <path d="M15 4v16M7 9h4M7 13h4" />
    </svg>
  );
}

function FitIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5" />
    </svg>
  );
}

export function AiWorkspace({ locale }: { locale: Locale }) {
  const copy = content[locale];
  const mockCases = useMemo(() => getMockCases(locale), [locale]);
  const caseGraphs = useMemo(
    () =>
      new Map(
        mockCases.map((item) => [item.id, createMockGraphFromTemplate(item.template, locale)]),
      ),
    [locale, mockCases],
  );
  const [mode, setMode] = useState<AiWorkspaceMode>('create');
  const [prompt, setPrompt] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [stage, setStage] = useState<WorkspaceStage>('landing');
  const [generationStep, setGenerationStep] = useState(0);
  const [result, setResult] = useState<MockGenerationResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputError, setInputError] = useState<string | null>(null);
  const [needsClarification, setNeedsClarification] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('conversation');
  const [isRefining, setIsRefining] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'code' | 'data' | 'error' | null>(null);
  const [graphStatus, setGraphStatus] = useState<AiNativeGraphStatus>('loading');
  const [graphError, setGraphError] = useState('');
  const [nativeGraphKey, setNativeGraphKey] = useState(0);
  const timersRef = useRef<number[]>([]);
  const promptRef = useRef<HTMLTextAreaElement | null>(null);
  const followUpRef = useRef<HTMLTextAreaElement | null>(null);
  const graphRef = useRef<AiNativeGraphHandle | null>(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((value) => value !== timer);
      callback();
    }, delay);
    timersRef.current.push(timer);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (!inspectorOpen) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setInspectorOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectorOpen]);

  const graphData = useMemo(() => (result ? serializeMockGraph(result.graph) : ''), [result]);
  const graphCode = useMemo(() => (result ? buildMockCode(result.graph) : ''), [result]);

  const selectCase = (caseId: string) => {
    const selected = mockCases.find((item) => item.id === caseId);
    if (!selected) return;
    setMode(selected.mode);
    setPrompt(selected.prompt);
    setInputError(null);
    setNeedsClarification(false);
    window.requestAnimationFrame(() => {
      promptRef.current?.focus();
      promptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const startGeneration = (event?: FormEvent) => {
    event?.preventDefault();
    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt) {
      setInputError(copy.emptyError);
      setNeedsClarification(false);
      promptRef.current?.focus();
      return;
    }

    if (needsMockPromptClarification(normalizedPrompt, locale, mode)) {
      setInputError(null);
      setNeedsClarification(true);
      promptRef.current?.focus();
      return;
    }

    clearTimers();
    setInputError(null);
    setNeedsClarification(false);
    setGenerationStep(0);
    setStage('generating');
    schedule(() => setGenerationStep(1), 260);
    schedule(() => setGenerationStep(2), 520);
    schedule(() => {
      const nextResult = generateMockResult(normalizedPrompt, locale, mode);
      setResult(nextResult);
      setMessages([
        { id: 'initial-user', role: 'user', text: normalizedPrompt },
        { id: 'initial-assistant', role: 'assistant', text: nextResult.reply },
      ]);
      setInspectorOpen(false);
      setInspectorTab('conversation');
      setGraphStatus('loading');
      setGraphError('');
      setNativeGraphKey((value) => value + 1);
      setStage('workspace');
    }, 820);
  };

  const onPromptKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      startGeneration();
    }
  };

  const refineGraph = (event?: FormEvent) => {
    event?.preventDefault();
    const normalizedFollowUp = followUp.trim();
    if (!normalizedFollowUp || !result || isRefining) return;

    const messageId = `message-${messages.length}`;
    setMessages((current) => [
      ...current,
      { id: `${messageId}-user`, role: 'user', text: normalizedFollowUp },
    ]);
    setFollowUp('');
    setIsRefining(true);
    schedule(() => {
      const nextResult = adjustMockGraph(result.graph, normalizedFollowUp, locale);
      setResult(nextResult);
      setMessages((current) => [
        ...current,
        { id: `${messageId}-assistant`, role: 'assistant', text: nextResult.reply },
      ]);
      setIsRefining(false);
    }, 560);
  };

  const onFollowUpKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      refineGraph();
    }
  };

  const restart = () => {
    clearTimers();
    setStage('landing');
    setGenerationStep(0);
    setResult(null);
    setMessages([]);
    setFollowUp('');
    setIsRefining(false);
    setInspectorOpen(false);
    setInspectorTab('conversation');
    setCopyStatus(null);
    setGraphError('');
    setNeedsClarification(false);
    window.requestAnimationFrame(() => promptRef.current?.focus());
  };

  const copyInspectorValue = async (tab: 'code' | 'data') => {
    const value = tab === 'data' ? graphData : graphCode;
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(value);
      setCopyStatus(tab);
      schedule(() => setCopyStatus(null), 1400);
    } catch {
      setCopyStatus('error');
    }
  };

  const handleGraphStatus = useCallback((status: AiNativeGraphStatus, message?: string) => {
    setGraphStatus(status);
    setGraphError(message ?? '');
  }, []);

  if (stage === 'generating') {
    return (
      <main className={styles.page} lang={locale === 'zh' ? 'zh-CN' : 'en'}>
        <section className={styles.generationScreen}>
          <div className={styles.generationCard}>
            <div className={styles.generationOrb}>
              <SparkIcon />
            </div>
            <span className={styles.mockBadge}>{copy.mock}</span>
            <h1>{copy.generationTitle}</h1>
            <p>{copy.generationDescription}</p>
            <blockquote>{prompt}</blockquote>
            <ol aria-live="polite" className={styles.generationSteps}>
              {copy.generationSteps.map((step, index) => (
                <li
                  className={
                    index < generationStep
                      ? styles.generationStepComplete
                      : index === generationStep
                        ? styles.generationStepActive
                        : ''
                  }
                  key={step}
                >
                  <span>{index < generationStep ? '✓' : index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <button className={styles.secondaryButton} onClick={restart} type="button">
              {copy.cancel}
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (stage === 'workspace' && result) {
    return (
      <main className={styles.page} lang={locale === 'zh' ? 'zh-CN' : 'en'}>
        <section className={styles.workspaceShell}>
          <header className={styles.workspaceHeader}>
            <div className={styles.workspaceTitle}>
              <span>{copy.workspaceEyebrow}</span>
              <h1>{result.graph.title}</h1>
              <p>{copy.graphStats(result.graph.nodes.length, result.graph.edges.length)}</p>
            </div>
            <div className={styles.workspaceHeaderActions}>
              <button className={styles.secondaryButton} onClick={restart} type="button">
                {copy.restart}
              </button>
              <button
                className={styles.primaryToolbarButton}
                onClick={() => setInspectorOpen(true)}
                type="button"
              >
                <PanelIcon />
                {copy.inspect}
              </button>
            </div>
          </header>

          <div className={styles.workspaceSurface}>
            <AiNativeGraph
              graph={result.graph}
              key={nativeGraphKey}
              locale={locale}
              onStatusChange={handleGraphStatus}
              ref={graphRef}
            />

            <div className={styles.canvasStatusBar}>
              <span className={styles.nativeBadge}>
                <span /> {copy.workspaceEyebrow}
              </span>
              <div>
                <span>{result.graph.layout}</span>
                <span>{result.graph.theme}</span>
              </div>
              <button onClick={() => graphRef.current?.fitView()} type="button">
                <FitIcon />
                {copy.fitView}
              </button>
            </div>

            {graphStatus !== 'ready' ? (
              <div aria-live="polite" className={styles.graphStatusOverlay}>
                {graphStatus === 'loading' ? (
                  <>
                    <span className={styles.loadingRing} />
                    <strong>{copy.rendering}</strong>
                  </>
                ) : (
                  <>
                    <strong>{copy.renderError}</strong>
                    {graphError ? <p>{graphError}</p> : null}
                    <button
                      onClick={() => {
                        setGraphStatus('loading');
                        setNativeGraphKey((value) => value + 1);
                      }}
                      type="button"
                    >
                      {copy.retry}
                    </button>
                  </>
                )}
              </div>
            ) : null}

            <form className={styles.commandDock} onSubmit={refineGraph}>
              <div className={styles.quickAdjustments}>
                {copy.quickAdjustments.map((adjustment) => (
                  <button
                    key={adjustment}
                    onClick={() => {
                      setFollowUp(adjustment);
                      window.requestAnimationFrame(() => followUpRef.current?.focus());
                    }}
                    type="button"
                  >
                    {adjustment}
                  </button>
                ))}
              </div>
              <label htmlFor="ai-follow-up">{copy.followUpLabel}</label>
              <div className={styles.commandInput}>
                <textarea
                  id="ai-follow-up"
                  maxLength={600}
                  onChange={(event) => setFollowUp(event.target.value)}
                  onKeyDown={onFollowUpKeyDown}
                  placeholder={copy.followUpPlaceholder}
                  ref={followUpRef}
                  rows={2}
                  value={followUp}
                />
                <button disabled={!followUp.trim() || isRefining} type="submit">
                  <span>{isRefining ? copy.refining : copy.followUpSend}</span>
                  <SendIcon />
                </button>
              </div>
            </form>

            <button
              aria-label={copy.closeInspector}
              className={`${styles.drawerBackdrop} ${inspectorOpen ? styles.drawerBackdropOpen : ''}`}
              onClick={() => setInspectorOpen(false)}
              type="button"
            />
            <aside
              aria-label={copy.inspectorTitle}
              className={`${styles.inspectorDrawer} ${inspectorOpen ? styles.inspectorDrawerOpen : ''}`}
            >
              <header className={styles.inspectorHeader}>
                <div>
                  <span>{copy.mock}</span>
                  <strong>{copy.inspectorTitle}</strong>
                </div>
                <button onClick={() => setInspectorOpen(false)} type="button">
                  <span aria-hidden="true">×</span>
                  <span className={styles.srOnly}>{copy.closeInspector}</span>
                </button>
              </header>
              <div className={styles.inspectorTabs} role="tablist">
                {(['conversation', 'data', 'code'] as const).map((tab) => (
                  <button
                    aria-selected={inspectorTab === tab}
                    key={tab}
                    onClick={() => setInspectorTab(tab)}
                    role="tab"
                    type="button"
                  >
                    {tab === 'conversation'
                      ? copy.conversation
                      : tab === 'data'
                        ? copy.data
                        : copy.code}
                  </button>
                ))}
              </div>

              {inspectorTab === 'conversation' ? (
                <div className={styles.messageList}>
                  <span className={styles.prototypePill}>{copy.prototypeReply}</span>
                  {messages.map((message) => (
                    <article
                      className={`${styles.message} ${
                        message.role === 'user' ? styles.messageUser : styles.messageAssistant
                      }`}
                      key={message.id}
                    >
                      <span>{message.role === 'user' ? copy.you : copy.assistant}</span>
                      <p>{message.text}</p>
                    </article>
                  ))}
                  {isRefining ? (
                    <div aria-live="polite" className={styles.refiningMessage}>
                      <span />
                      <span />
                      <span />
                      {copy.refining}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className={styles.codeInspector}>
                  <div className={styles.codeInspectorToolbar}>
                    <span>{inspectorTab === 'data' ? copy.data : copy.code}</span>
                    <button onClick={() => copyInspectorValue(inspectorTab)} type="button">
                      {copyStatus === inspectorTab ? copy.copied : copy.copy}
                    </button>
                  </div>
                  <pre tabIndex={0}>
                    <code>{inspectorTab === 'data' ? graphData : graphCode}</code>
                  </pre>
                  <p aria-live="polite">{copyStatus === 'error' ? copy.copyFailed : ''}</p>
                </div>
              )}
            </aside>
          </div>

          <p className={styles.prototypeNotice}>{copy.prototypeNotice}</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page} lang={locale === 'zh' ? 'zh-CN' : 'en'}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <span className={styles.mockBadge}>{copy.mock}</span>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1>
              {copy.titleLead} <span>{copy.titleAccent}</span>
            </h1>
            <p className={styles.heroDescription}>{copy.description}</p>
            <div className={styles.heroFacts}>
              <span>WebGL</span>
              <span>G6Lite Graph</span>
              <span>Local Mock</span>
            </div>
          </div>

          <div className={styles.composerColumn}>
            <div aria-label={copy.eyebrow} className={styles.modeSwitch} role="group">
              {(['create', 'qa'] as const).map((item) => (
                <button
                  aria-pressed={mode === item}
                  className={mode === item ? styles.modeActive : ''}
                  key={item}
                  onClick={() => {
                    setMode(item);
                    setNeedsClarification(false);
                  }}
                  type="button"
                >
                  <SparkIcon />
                  {copy.modes[item].label}
                </button>
              ))}
            </div>

            <form className={styles.promptCard} onSubmit={startGeneration}>
              <label htmlFor="ai-prompt">{copy.inputLabel}</label>
              <textarea
                aria-describedby={inputError ? 'ai-prompt-error' : 'ai-prompt-privacy'}
                id="ai-prompt"
                maxLength={1200}
                onChange={(event) => {
                  setPrompt(event.target.value);
                  if (inputError) setInputError(null);
                  if (needsClarification) setNeedsClarification(false);
                }}
                onKeyDown={onPromptKeyDown}
                placeholder={copy.placeholders[mode]}
                ref={promptRef}
                rows={7}
                value={prompt}
              />
              <div className={styles.promptFooter}>
                <div>
                  <span className={styles.stackPill}>
                    <span /> G6Lite
                  </span>
                  <span className={styles.inputHint}>{copy.inputHint}</span>
                </div>
                <button className={styles.sendButton} type="submit">
                  <span>{copy.send}</span>
                  <SendIcon />
                </button>
              </div>
            </form>

            {inputError ? (
              <p className={styles.inputError} id="ai-prompt-error" role="alert">
                {inputError}
              </p>
            ) : null}
            {needsClarification ? (
              <div className={styles.clarificationCard} role="status">
                <div>
                  <strong>{copy.clarificationTitle}</strong>
                  <p>{copy.clarificationDescription}</p>
                </div>
                <button
                  onClick={() => {
                    setPrompt(copy.clarificationExample);
                    setNeedsClarification(false);
                    window.requestAnimationFrame(() => promptRef.current?.focus());
                  }}
                  type="button"
                >
                  {copy.useClarificationExample}: “{copy.clarificationExample}”
                </button>
              </div>
            ) : null}
            <p className={styles.privacy} id="ai-prompt-privacy">
              {copy.privacy}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.casesSection}>
        <div className={styles.sectionHeading}>
          <div>
            <p>{copy.casesTitle}</p>
            <h2>{copy.casesDescription}</h2>
          </div>
          <span>{mockCases.length.toString().padStart(2, '0')}</span>
        </div>
        <div className={styles.caseGrid}>
          {mockCases.map((item, index) => {
            const caseGraph = caseGraphs.get(item.id);
            return (
              <button
                aria-label={`${copy.useCase}: ${item.title}`}
                className={styles.caseCard}
                key={item.id}
                onClick={() => selectCase(item.id)}
                type="button"
              >
                <div className={styles.caseCardTop}>
                  <span>{copy.modes[item.mode].short}</span>
                  <strong>{(index + 1).toString().padStart(2, '0')}</strong>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                {caseGraph ? (
                  <div className={styles.caseDetails}>
                    <span>{copy.nodes(caseGraph.nodes.length)}</span>
                    <span>{copy.relations(caseGraph.edges.length)}</span>
                    <span>{copy.layouts[caseGraph.layout as MockGraphLayout]}</span>
                  </div>
                ) : null}
                <span className={styles.caseAction}>{copy.useCase} →</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.learnSection}>
        <p>{copy.learnTitle}</p>
        <div>
          {copy.learnLinks.map(([label, path]) => (
            <Link href={localizedPath(path, locale)} key={path}>
              {label} <span>↗</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
