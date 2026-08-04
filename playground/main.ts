import { demos, getDemo, normalizeDemoId, runDemo, type DemoHandle, type DemoItem } from './demos/index.ts';

declare global {
  interface Window {
    __G6LITE_DEMO__?: {
      id: string;
      status: 'loading' | 'ready' | 'error';
      error?: string;
    };
  }
}

let currentHandle: DemoHandle | null = null;
let currentDemoId = '';
let activationVersion = 0;

function renderSidebar(): void {
  const list = document.getElementById('sidebar-list')!;
  const fragment = document.createDocumentFragment();

  demos.forEach((demo, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'demo-card';
    card.dataset.id = demo.id;
    card.dataset.search = `${demo.id} ${demo.title} ${demo.description} ${demo.category}`.toLowerCase();
    card.innerHTML = `
      <span class="demo-index">${index + 1}</span>
      <span class="demo-card-content">
        <span class="demo-name">${demo.title}</span>
        <span class="demo-category">${demo.category}</span>
      </span>
    `;
    card.addEventListener('click', () => {
      window.location.hash = demo.id;
    });
    fragment.appendChild(card);
  });

  list.replaceChildren(fragment);
}

function highlightSidebar(id: string): void {
  document.querySelectorAll<HTMLElement>('.demo-card').forEach((element) => {
    element.classList.toggle('active', element.dataset.id === id);
  });
}

function initSearch(): void {
  const input = document.getElementById('search-input') as HTMLInputElement;
  input.addEventListener('input', () => {
    const keyword = input.value.trim().toLowerCase();
    document.querySelectorAll<HTMLElement>('.demo-card').forEach((element) => {
      element.hidden = Boolean(keyword) && !element.dataset.search?.includes(keyword);
    });
  });
}

function setCodePanel(text: string): void {
  const codePre = document.getElementById('code-content') as HTMLPreElement;
  codePre.textContent = text;
}

function setRunnerStatus(status: string): void {
  document.getElementById('demo-status')!.textContent = status;
}

function initCopy(): void {
  const button = document.getElementById('copy-btn')!;
  button.addEventListener('click', async () => {
    const codePre = document.getElementById('code-content') as HTMLPreElement;
    try {
      await navigator.clipboard.writeText(codePre.textContent ?? '');
      button.textContent = '已复制';
      window.setTimeout(() => (button.textContent = '复制'), 1200);
    } catch {
      button.textContent = '复制失败';
      window.setTimeout(() => (button.textContent = '复制'), 1200);
    }
  });
}

function initResize(): void {
  const handle = document.getElementById('resize-handle')!;
  const codePanel = document.getElementById('code-panel')!;
  const graphContainer = document.getElementById('graph-container')!;
  let resizing = false;
  let fitFrame: number | null = null;

  const fitCurrentView = () => {
    fitFrame = null;
    void currentHandle?.fitView?.();
  };

  const scheduleFitView = () => {
    if (fitFrame !== null) return;
    fitFrame = requestAnimationFrame(fitCurrentView);
  };

  const scheduleFinalFitView = () => {
    if (fitFrame !== null) cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(() => {
      fitFrame = requestAnimationFrame(fitCurrentView);
    });
  };

  const resizeObserver = new ResizeObserver(() => {
    if (resizing) scheduleFitView();
  });
  resizeObserver.observe(graphContainer);

  handle.addEventListener('mousedown', (event) => {
    const startX = event.clientX;
    const startWidth = codePanel.offsetWidth;
    resizing = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (moveEvent: MouseEvent) => {
      const nextWidth = startWidth + startX - moveEvent.clientX;
      codePanel.style.width = `${Math.max(280, Math.min(window.innerWidth * 0.6, nextWidth))}px`;
    };
    const onUp = () => {
      resizing = false;
      scheduleFinalFitView();
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

function destroyCurrentDemo(): void {
  currentHandle?.destroy();
  currentHandle = null;
}

function renderError(container: HTMLElement, error: unknown): string {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  const pre = document.createElement('pre');
  pre.className = 'demo-error';
  pre.textContent = message;
  container.replaceChildren(pre);
  return message;
}

async function loadSource(demo: DemoItem, version: number): Promise<void> {
  try {
    const source = await demo.loadSource();
    if (version === activationVersion) setCodePanel(source);
  } catch (error) {
    if (version === activationVersion) setCodePanel(`// Failed to load source\n${String(error)}`);
  }
}

async function activateDemo(requestedId: string, force = false): Promise<void> {
  const id = normalizeDemoId(requestedId);
  if (!force && id === currentDemoId) return;
  const demo = getDemo(id);
  if (!demo) return;

  const version = ++activationVersion;
  currentDemoId = demo.id;
  destroyCurrentDemo();
  highlightSidebar(demo.id);

  document.getElementById('demo-title')!.textContent = demo.title;
  document.getElementById('demo-id-label')!.textContent = demo.id;
  document.getElementById('demo-description')!.textContent = demo.description;
  setCodePanel('// Loading source…');
  setRunnerStatus('加载中');
  window.__G6LITE_DEMO__ = { id: demo.id, status: 'loading' };

  const container = document.getElementById('graph-container')!;
  container.replaceChildren();
  void loadSource(demo, version);

  try {
    const handle = await runDemo(demo, container);
    if (version !== activationVersion) {
      handle.destroy();
      return;
    }
    currentHandle = handle;
    await handle.ready;
    if (version !== activationVersion) return;
    setRunnerStatus('已就绪');
    window.__G6LITE_DEMO__ = { id: demo.id, status: 'ready' };
  } catch (error) {
    if (version !== activationVersion) return;
    const message = renderError(container, error);
    setRunnerStatus('运行失败');
    window.__G6LITE_DEMO__ = { id: demo.id, status: 'error', error: message };
    console.error(error);
  }
}

function initKeyboard(): void {
  window.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    const index = demos.findIndex((demo) => demo.id === currentDemoId);
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) return;

    event.preventDefault();
    const delta = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
    const next = (index + delta + demos.length) % demos.length;
    window.location.hash = demos[next].id;
  });
}

function init(): void {
  renderSidebar();
  initSearch();
  initCopy();
  initResize();
  initKeyboard();

  const requested = normalizeDemoId(window.location.hash.slice(1));
  const initialId = getDemo(requested)?.id ?? demos[0]?.id;
  if (initialId) void activateDemo(initialId);

  window.addEventListener('hashchange', () => {
    const nextId = normalizeDemoId(window.location.hash.slice(1));
    if (getDemo(nextId)) void activateDemo(nextId);
  });
  window.addEventListener('beforeunload', destroyCurrentDemo);
}

document.addEventListener('DOMContentLoaded', init);

if (import.meta.hot) {
  import.meta.hot.dispose(destroyCurrentDemo);
  import.meta.hot.accept(() => {
    if (currentDemoId) void activateDemo(currentDemoId, true);
  });
}
