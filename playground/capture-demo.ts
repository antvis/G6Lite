import { getDemo, normalizeDemoId, runDemo, type DemoHandle } from './demos/index.ts';

const originalGetContext = HTMLCanvasElement.prototype.getContext;

HTMLCanvasElement.prototype.getContext = function (
  this: HTMLCanvasElement,
  kind: string,
  attrs?: WebGLContextAttributes,
) {
  if (kind === 'webgl' || kind === 'webgl2' || kind === 'experimental-webgl') {
    return originalGetContext.call(this, kind, { ...attrs, preserveDrawingBuffer: true });
  }
  return originalGetContext.call(this, kind, attrs);
} as typeof HTMLCanvasElement.prototype.getContext;

declare global {
  interface Window {
    __ready?: boolean;
    __captureError?: string;
    __G6LITE_DEMO__?: {
      id: string;
      status: 'loading' | 'ready' | 'error';
      error?: string;
    };
  }
}

let handle: DemoHandle | null = null;

async function main(): Promise<void> {
  const requested = normalizeDemoId(window.location.hash.slice(1) || 'basic');
  const demo = getDemo(requested);
  const stage = document.getElementById('stage')!;

  if (!demo) throw new Error(`Unknown demo: ${requested}`);

  window.__ready = false;
  window.__captureError = undefined;
  window.__G6LITE_DEMO__ = { id: demo.id, status: 'loading' };
  stage.replaceChildren();

  handle = await runDemo(demo, stage);
  await handle.ready;
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => setTimeout(resolve, demo.capture.settleMs ?? 450));

  document.querySelectorAll<HTMLElement>('[data-capture-ignore]').forEach((element) => {
    element.style.display = 'none';
  });
  await new Promise((resolve) => requestAnimationFrame(resolve));

  window.__ready = true;
  window.__G6LITE_DEMO__ = { id: demo.id, status: 'ready' };
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  window.__captureError = message;
  window.__G6LITE_DEMO__ = {
    id: normalizeDemoId(window.location.hash.slice(1) || 'basic'),
    status: 'error',
    error: message,
  };
  const stage = document.getElementById('stage');
  if (stage) {
    const pre = document.createElement('pre');
    pre.style.cssText = 'padding:16px;color:#d4380d;white-space:pre-wrap';
    pre.textContent = message;
    stage.replaceChildren(pre);
  }
});

window.addEventListener('beforeunload', () => handle?.destroy());

if (import.meta.hot) import.meta.hot.dispose(() => handle?.destroy());
