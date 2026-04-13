/**
 * G6Lite Examples — G6 官网风格：左侧目录 + 中间预览 + 右侧代码
 */
import { demos } from './demos/index.ts';

let currentInstance: { destroy?: () => void } | null = null;
let currentDemoId = '';

// ---- Sidebar ----
function renderSidebar() {
  const list = document.getElementById('sidebar-list')!;
  list.innerHTML = '';
  demos.forEach((d, i) => {
    const card = document.createElement('div');
    card.className = 'demo-card';
    card.setAttribute('data-id', d.id);
    card.innerHTML = `
      <span class="demo-index">${i + 1}</span>
      <span class="demo-name">${d.name}</span>
    `;
    card.onclick = () => {
      window.location.hash = d.id;
      activateDemo(d.id);
    };
    list.appendChild(card);
  });
}

function highlightSidebar(id: string) {
  document.querySelectorAll('.demo-card').forEach((el) => {
    el.classList.toggle('active', el.getAttribute('data-id') === id);
  });
}

// ---- Search ----
function initSearch() {
  const input = document.getElementById('search-input') as HTMLInputElement;
  input.addEventListener('input', () => {
    const keyword = input.value.toLowerCase();
    document.querySelectorAll('.demo-card').forEach((el) => {
      const name = el.querySelector('.demo-name')?.textContent?.toLowerCase() ?? '';
      const id = el.getAttribute('data-id')?.toLowerCase() ?? '';
      (el as HTMLElement).style.display =
        name.includes(keyword) || id.includes(keyword) ? '' : 'none';
    });
  });
}

// ---- Code Panel ----
function setCodePanel(demo: (typeof demos)[number] | undefined) {
  const codePre = document.getElementById('code-content') as HTMLPreElement;
  codePre.textContent = demo?.source ?? '// (source not available)';
}

function initCopy() {
  const btn = document.getElementById('copy-btn')!;
  btn.addEventListener('click', async () => {
    const codePre = document.getElementById('code-content') as HTMLPreElement;
    const text = codePre.textContent ?? '';
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = '已复制';
      setTimeout(() => (btn.textContent = '复制'), 1200);
    } catch {
      /* ignore */
    }
  });
}

// ---- Resize Handle ----
function initResize() {
  const handle = document.getElementById('resize-handle')!;
  const codePanel = document.getElementById('code-panel')!;
  let startX = 0;
  let startW = 0;

  handle.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    startW = codePanel.offsetWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      const diff = startX - ev.clientX;
      codePanel.style.width = `${Math.max(280, Math.min(window.innerWidth * 0.6, startW + diff))}px`;
    };
    const onUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

// ---- Demo Runner ----
async function activateDemo(id: string) {
  if (id === currentDemoId) return;
  const demo = demos.find((d) => d.id === id);
  if (!demo) return;

  currentDemoId = id;
  highlightSidebar(id);

  // Header
  document.getElementById('demo-title')!.textContent = demo.name;
  document.getElementById('demo-id-label')!.textContent = demo.id;

  // Code
  setCodePanel(demo);

  // Cleanup
  if (currentInstance?.destroy) currentInstance.destroy();
  currentInstance = null;

  // Render
  const container = document.getElementById('graph-container')!;
  container.innerHTML = '';

  try {
    const result = await demo.run(container);
    currentInstance = result as { destroy?: () => void } | null;
  } catch (e) {
    console.error(e);
    container.innerHTML = `<pre style="padding:16px;color:#e74c3c;font-size:13px;">${String(e)}</pre>`;
  }
}

// ---- Keyboard Navigation ----
function initKeyboard() {
  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement) return;
    const idx = demos.findIndex((d) => d.id === currentDemoId);
    if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const next = (idx + 1) % demos.length;
      window.location.hash = demos[next].id;
      activateDemo(demos[next].id);
    } else if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
      e.preventDefault();
      const prev = (idx - 1 + demos.length) % demos.length;
      window.location.hash = demos[prev].id;
      activateDemo(demos[prev].id);
    }
  });
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  initSearch();
  initCopy();
  initResize();
  initKeyboard();

  // Load from hash or default to first
  const hash = window.location.hash.slice(1);
  const id = hash && demos.some((d) => d.id === hash) ? hash : demos[0]?.id;
  if (id) activateDemo(id);

  window.addEventListener('hashchange', () => {
    const h = window.location.hash.slice(1);
    if (h) activateDemo(h);
  });
});
