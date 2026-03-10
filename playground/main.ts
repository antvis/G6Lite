/**
 * G6Lite Playground — 使用文档配套 Demo 入口
 * 左侧选择 Demo，右侧渲染对应示例
 */
import { demos } from './demos/index.ts';
import { attachCanvasTools } from './tooling.ts';

const CONTAINER_SELECTOR = '#graph-container';
let currentInstance: { destroy?: () => void } | null = null;

function isGraphWithTools(g: unknown): g is { getCamera(): unknown; setCamera(v: unknown): void; getCanvas(): unknown } {
  return !!g && typeof (g as { getCamera?: unknown }).getCamera === 'function' && typeof (g as { setCamera?: unknown }).setCamera === 'function' && typeof (g as { getCanvas?: unknown }).getCanvas === 'function';
}

async function runDemo(id: string) {
  const demo = demos.find((d) => d.id === id);
  if (!demo) return;

  if (currentInstance) {
    if (typeof (currentInstance as { destroy?: () => void }).destroy === 'function') {
      (currentInstance as { destroy: () => void }).destroy();
    }
    currentInstance = null;
  }

  const container = document.querySelector(CONTAINER_SELECTOR);
  if (!container) return;

  container.innerHTML = '';
  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'canvas-wrap';
  container.appendChild(canvasWrap);

  try {
    const result = await demo.run(canvasWrap);
    currentInstance = result as { destroy?: () => void } | null;
    if (result && isGraphWithTools(result)) {
      attachCanvasTools(canvasWrap as HTMLElement, result);
    }
  } catch (e) {
    console.error(e);
    container.innerHTML = `<pre style="padding:12px;color:#f66;">${String(e)}</pre>`;
  }
}

function renderSidebar() {
  const sidebar = document.getElementById('sidebar')!;
  sidebar.innerHTML = '<div class="sidebar-title">Demos</div>';
  demos.forEach((d) => {
    const a = document.createElement('a');
    a.href = '#' + d.id;
    a.className = 'demo-link';
    a.setAttribute('data-demo-id', d.id);
    a.textContent = d.name;
    a.onclick = (e) => {
      e.preventDefault();
      document.querySelectorAll('.demo-link').forEach((el) => el.classList.remove('active'));
      a.classList.add('active');
      runDemo(d.id);
    };
    sidebar.appendChild(a);
  });
}

function initFromHash() {
  const hash = window.location.hash.slice(1);
  const id = hash && demos.some((d) => d.id === hash) ? hash : demos[0]?.id;
  if (id) {
    const link = document.querySelector(`.demo-link[data-demo-id="${id}"]`);
    if (link) (link as HTMLElement).classList.add('active');
    runDemo(id);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  initFromHash();
  window.addEventListener('hashchange', () => {
    const id = window.location.hash.slice(1);
    if (id) runDemo(id);
  });
});
